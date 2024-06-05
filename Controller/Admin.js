const bcrypt = require("bcryptjs")
const Admin = require("../Model/Admin");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const moment = require("moment");
const Doctors = require("../Model/Doctor");
const Patients = require("../Model/Patient");

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth:{
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
})


function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

function isOTPExpired(createdAt){
    const expirationTime = moment(createdAt).add(10,"minutes")
    return moment()>expirationTime;
}

const verifyOtp = async(req,res)=>{
    try {
    
        let user = await Admin.findOne({otp: req.body.otp});
        if(!user){
         return  res.json({success:false, message: "code not found"})
        }else{
 const isExpired = isOTPExpired(user.updatedAt);
            if(isExpired){
                return res.json({success: false, message: "Your otp is expired"})
            }else{
                const data = await Admin.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {otp: "", account_verified: true}},
                    {new: true});
                    res.json({success: true, message: "Your otp is verified", id: data._id});
            }
        }
        
    } catch (error) {
       return res.json({success:false, message: 'Internal server error'})
    }
};


const checkEmail = async(req,res)=>{
    try {
     const user = await Admin.findOne({email: req.body.email});
     if(!user){
        return res.json({success:false, message: "User with this email does not exist"})
     }else {
        const otp = generateOTP();
           await Admin.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {otp: otp}},
                    {new: true});
          let mailOption = {
                from: process.env.SMTP_MAIL,
                to: req.body.email,
                subject: "Otp verification",
                text: `Your otp is: ${otp} will expire after 10 minutes`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            return res.json({success: true, message: error})
          }else{
           res.json({success: false, message: "Please check your email otp has been sent."})
          }
            });          
     }
    } catch (error) {
      console.log(error.message);
       return  res.json({success: false, message: 'Internal Server error'})
    }
}

const resetPassword = async(req,res)=>{
    try {
        const data = await Admin.findOne({ _id: req.body.id });
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password, salt);
     const userData = await Admin.findByIdAndUpdate(
      { _id: data._id },
      { $set: { password: securePass } },
      { new: true }
    );
    res.json({success: false, message: "Your password has been reset"});

    } catch (error) {
       return res.json({success: true, message: error.message})
    }
}



const signup = async(req,res)=>{

    const { email, password } = req.body;
  try {
    let user = await Admin.findOne({email});
  if (user) {
    return res.json({success:false, message: "Sorry a user with this email already exists"});
  }

  const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);
    user = await Admin.create({
      password: secPass,
      email: email,
    });
    const data = {
      user: {
        id: user.id
      }
    }
     const token = jwt.sign(data,process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
    res.json({success: true, message:"user created successfully",token});
  
  } catch (error) {
     console.error(error.message);
     return res.json({success: false, message: 'Internal server error'});
  }

}

const login = async(req,res)=>{
const { email, password } = req.body;
  try {
    let user = await Admin.findOne({ email });
    if (!user) {
      return res.json({success: false, error: "Please try to login with correct email" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.json({ success:false, error: "Please try to login with correct password" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
       const token = jwt.sign(data,process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
       res.json({success: true, message:"user logged in  successfully",token});
   
  } catch (error) {
     console.error(error.message);
     return res.json({success: false, message: 'Internal server error'});
  }

}

 const fetchUserByID = async(req,res)=>{
   try {
    const user = await Admin.findById(req.user.id).select("-password")
    res.json({success: true, message: user})
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message:"Internal Server Error"});
  }
 }

//patient doctors,appointments count
const countData = async(req,res)=>{
  try {

const doctors = await Doctors.find();
const patient = await Patients.find();
res.json({success: true, total_doctors: doctors.length,total_patients: patients.length});


    
  } catch (error) {
     console.log(error.message);
    return res.json({success: false, message: 'Internal Server error'});
  }
}

//doctors list
 const doctors = async(req,res)=>{
  try {
    const doctors = await Doctors.find({}, '-password');
     res.json({success: true,total_doctors: doctors.length, doctors_list: doctors});

  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Internal Server error'});
  }
 }
//patients list
 const patients = async(req,res)=>{
  try {
    
    const patients = await Patients.find({}, '-password');
     res.json({success: true,total_patients: patients.length, patients_list: patients});

  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Internal Server error'});
  }
 }
 //account approval request
 const doctorsAccounts = async(req,res)=>{

  const {id} = req.params;
  try {
      
     if(req.body.account_approved === true){
const user = await Doctors.findByIdAndUpdate(id, req.body, { new: true });
     if(user){
 let mailOption = {
                from: process.env.SMTP_MAIL,
                to: req.body.email,
                subject: "Account approved",
                text: `your account is approved by the admin now you can login the doctor portal and enjoy the services of our platform. email:${req.body.email} and password:${"Test@12345"}`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            return res.json({success: false, message: error.message})
          }else{
           res.json({success: true, message: "Email has been sent on the doctor email"})
          }
            }); 
     }
     }else{
      const user = await Doctors.findByIdAndUpdate(id, req.body, { new: true });
     if(user){
 let mailOption = {
                from: process.env.SMTP_MAIL,
                to: req.body.email,
                subject: "Account Declined",
                text: `your account is declined by the admin so you can contact on our official email `
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            return res.json({success: false, message: error.message})
          }else{
           res.json({success: true, message: "Email has been sent on the doctor email"})
          }
            }); 
     }
     }

     
  } catch (error) {
    console.log(error.message);
    res.json({success: false,message: "Internal Serve error"});
  }
 }



module.exports = {
  signup,
  login,
  fetchUserByID,
  verifyOtp,
  checkEmail,
  resetPassword,
  doctors,
  patients,
  doctorsAccounts,
  countData
}
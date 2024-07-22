const bcrypt = require("bcryptjs")
const Admin = require("../Model/Admin");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const moment = require("moment");
const User = require("../Model/User");
const Appointments = require("../Model/Appointments");
const Payments = require("../Model/Payment");

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
    //  const token = jwt.sign(data,process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
    res.json({success: true, message:"admin created successfully"});
  
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
      return res.json({success: false, message: "Please try to login with correct email" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.json({ success:false, message: "Please try to login with correct password" });
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
 // fetch doctor by id
 const fetchDoctorByID = async(req,res)=>{
  try {

    const doctor = await User.findById(req.body.id).select("-password");
    res.json({success: true, message: doctor});
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
 }

//patient doctors,appointments count
const countData = async(req,res)=>{
  try {
const doctor = await User.find({role: req.body.role});
const patient = await User.find({role: req.body.role1});
const appointments = await Appointments.find();
const payments = await Payments.find();
const adminAmountsDict = {};
 payments.forEach(payment => {
    adminAmountsDict[payment._id] = payment.admin_percentage_amount || 0;
  });
  let totalAdminAmount = 0;
  payments.forEach(payment => {
    const adminAmount = adminAmountsDict[payment._id] || 0;
    totalAdminAmount += adminAmount;
   // console.log(`Payment ID: ${payment._id}, Admin Percentage Amount: ${adminAmount}`);
  });
res.json({success: true, total_doctors: doctor.length,total_patients: patient.length, total_appointments: appointments.length,admin_revenue: totalAdminAmount});    
  } catch (error) {
     console.log(error.message);
    return res.json({success: false, message: 'Internal Server error'});
  }
}

//doctors list
 const doctors = async(req,res)=>{
  try {
    const doctors = await User.find({role: req.body.role}, '-password');
     res.json({success: true,total_doctors: doctors.length, doctors_list: doctors});

  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Internal Server error'});
  }
 }
//patients list
 const patients = async(req,res)=>{
  try {
    
    const patients = await User.find({role: req.body.role}, '-password');
     res.json({success: true,total_patients: patients.length, patients_list: patients});

  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Internal Server error'});
  }
 }



// approval request for the account accept or declined
const approvalRequest = async(req,res)=>{
  try {
     const {id,status} = req.body;
         const doctor = await User.findById({_id: id});
    if(status === true){
      const doctorData = await User.findByIdAndUpdate(
      { _id: doctor._id },
      { $set: { account_approved: true } },
      { new: true }
    );
  
    let mailOption = {
                from: process.env.SMTP_MAIL,
                to: doctor.email,
                subject: "Account approved",
                text: `Benvenuto a bordo di Video Medico, Dottor ${doctor.firstName} ${doctor.lastName}`+ process.env.DOCTOR_REGISTRATION
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            return res.json({success: true, message: error})
          }else{
           res.json({success: true, message: "Email sent to the doctor email"})
          }
            });   
    }else{
 const doctorData = await User.findByIdAndUpdate(
      { _id: doctor._id },
      { $set: { account_declined: true } },
      { new: true }
    );
  
    let mailOption = {
                from: process.env.SMTP_MAIL,
                to: doctor.email,
                subject: "Account Declined",
                text: `Sad!! this is the official email y the admin your account is declined and you can contact again with the official email.`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            return res.json({success: true, message: error})
          }else{
           res.json({success: true, message: "Email sent to the doctor email"})
          }
            }); 
    }
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}

//Get all transactions
const getTransactions = async(req,res)=>{
  try {
    const payments = await Payments.find().populate('patient', '_id firstName lastName picture_url default_picture_url').populate('doctor','_id firstName lastName');
    res.json({success: true, total_payments: payments.length,payments_list: payments});
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
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
  countData,
  fetchDoctorByID,
  approvalRequest,
  getTransactions
}
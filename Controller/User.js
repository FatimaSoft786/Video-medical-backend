const bcrypt = require("bcryptjs")
const User = require("../Model/User");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const path = require('path');
//cloudinary
const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDKEY,
    api_secret: process.env.CLOUDSECRET
});
// mail transporter
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth:{
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});
// generate otp
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}
//check otp expiration
function isOTPExpired(createdAt){
    const expirationTime = moment(createdAt).add(10,"minutes")
    return moment()>expirationTime;
}
// register user
const register = async(req,res)=>{
    try {
        let check = await User.findOne({email: req.body.email});
        if(check){
           return  res.json({success:false,message: "Sorry a user with this email already exist"})
        }else{
    const otp = generateOTP();
        if(req.body.role === 'Patient'){
     const salt = await bcrypt.genSalt(10);
     const securePass = await bcrypt.hash(req.body.password,salt)
          check = await User.create({
                email: req.body.email,
                password: securePass,
                phoneNumber: req.body.phoneNumber,
                otp: otp,
                role: req.body.role
            });
          let mailOption = {
                from: process.env.SMTP_MAIL,
                to: req.body.email,
                subject: "Otp verification",
                text: `Your otp is: ${otp} will expire after 10 minutes`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            console.log(error.message);
          return  res.json({success:false, message: "Error in google server"})
          }else{
            res.json({success:true, message: "Please check your email code has been sent."})
          }
            });
        }else{
           if (!req?.files?.cv)
      return res.json({success: false, message: "Please select an pdf"})
    const file = req.files.cv;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "doctors_cv",
    });
    if(result){
        const salt = await bcrypt.genSalt(10);
            const securePass = await bcrypt.hash("Test@12345",salt)
            doctor_info = await User.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                dob: req.body.dob,
                password: securePass,
                sex: req.body.sex,
                role: req.body.role,
                postal_code: req.body.postalCode,
                studies_start_year: req.body.studies_start_year,
                studies_end_year: req.body.studies_end_year,
                special_recognition: req.body.special_recognition,
                specialist: req.body.specialist,
                location: req.body.location,
                phoneNumber: req.body.phoneNo,
                clinic_hospital_address: req.body.clinic_hospital_address,
                about: req.body.about_info,
                doctor_cv_url: result.secure_url,
                cv_public_id: result.public_id
            });
            res.json({success:true,message: "Your form request has been sent to the admin please wait for the account approval",account_approved: doctor_info.account_approved,role: doctor_info.role});
          }
        }
 }
    } catch (error) {
      console.log(error.message);
       return res.json({success:false,message: "Internal server error"});
    }
};
// user login
const login = async(req,res)=>{
    const { email, password } = req.body;
  try {
    let user = await User.findOne({email: email });
    if (!user) {
      return res.json({success: false, message: "Please try to login with correct email" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.json({ success:false, message: "Please try to login with correct password" });
    }
     if(user.account_verified === false){
      return res.json({success: false, message: "Please first do verify your account", account_verified: user.account_verified});
     }
    const data = {
      user: {
        id: user.id
      }
    }
    
       const accessToken = jwt.sign(data,process.env.JWT_SECRET_KEY);
      // const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION;
       res.json({success: true,account_approved: user.account_approved, role: user.role,accessToken});
   
  } catch (error) {
     console.error(error.message);
     return res.json({success: false, message: 'Internal server error'});
  }
};
// verify patient
const verifyUser = async(req,res)=>{
    try {
        let user = await User.findOne({otp: req.body.otp});
        if(!user){
          return res.json({success:false, message: "Code not found"})
        }else{
            if(req.body.role === "Patient"){
const isExpired = isOTPExpired(user.updatedAt);
            if(isExpired){
                 res.json({success:false, message: "Your otp is expired"})
            }else{
                const patientData = await User.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {otp: "", account_approved: true}},
                    {new: true}).select("-password");
      
    const data = {
      user: {
        id: user.id
      }
    }
     const accessToken = jwt.sign(data,process.env.JWT_SECRET_KEY);
       res.json({success: true, message:"account verified successfully",account_approved: true,accessToken});
            }
            }
        } 
    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: "Internal server error"})
    }
};
// check user email
const checkEmail = async(req,res)=>{
    try {
     const user = await User.findOne({email: req.body.email});
     if(!user){
        return res.json({success:false, message: "User with this email does not exist"})
     }else {
        const otp = generateOTP();
           await User.findByIdAndUpdate(
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
          return  res.json({success:false, message: error})
          }else{
            res.json({success:true, message: "Please check your email code has been sent on the email."})
          }
            });          
     }
    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: 'Internal server error'})
    }
}
//reset password
const resetPassword = async(req,res)=>{
    try {
        const data = await User.findOne({ _id: req.body.id });
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password, salt);
     const userData = await User.findByIdAndUpdate(
      { _id: data._id },
      { $set: { password: securePass }},
      { new: true }
    );
    res.json({success:true, message: "Your password has been updated"});

    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: 'Internal server error'})
    }
}
//verify otp code
const verifyOtp = async(req,res)=>{
    try {
    
        let user = await User.findOne({otp: req.body.otp});
        if(!user){
         return  res.json({success:false, message: "code not found"})
        }else{
      const isExpired = isOTPExpired(user.updatedAt);
            if(isExpired){
                return res.json({success: false, message: "Your otp is expired"})
            }else{
                const data = await User.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {otp: ""}},
                    {new: true});
                    res.json({success: true, message:data._id});
            }
        }
        
    } catch (error) {
       return res.json({success:false, message: 'Internal server error'})
    }
};
//edit patient profile
const editPatientProfile = async(req,res)=>{
    try {
        const user =  await User.findOne({_id: req.body.patientId});
        if(user){
            const data = await User.findByIdAndUpdate(
        { _id: req.body.patientId },
        {
          $set: {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "email": req.body.email,
        "phoneNumber": req.body.phoneNumber,
        "dob": req.body.dob,
        "location": req.body.location,
        "postal_code": req.body.postal_code,
        "sex": req.body.sex,
          },
        },
        { new: true }
      );
       res.json({success: true, message: data})
        }
        
    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: "Internal server error"});
    }
}
//upload profile picture
 const uploadProfilePicture = async(req,res)=>{
  try { 
if (!req?.files?.profile)
      return res.json({success: false, message: "Please upload an image"})
    const file = req.files.profile;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "profile",
    });
    console.log(result)
    if(result){
        const data = await User.findByIdAndUpdate(
            {_id: req.body.patientId},
            {$set: {pic_public_id: result.public_id,picture_url: result.secure_url}},
            {new: true})
            res.json({success: true, message: "Image uploaded on the cloud"})
    }
  } catch (error) {
    console.log(error.message);
    res.json({success: false,message: "Internal server error"});
  }
};
//delete profile picture
const deleteProfilePicture = async(req,res)=>{
    try {
        const data = await User.findOne({pic_public_id: req.body.public_id});
        if(!data){
             return res.json({success: false,message: "profile picture does not exist"})
        }else{
const result =  await cloudinary.uploader.destroy(req.body.public_id);
if(result.result === 'ok'){

const doc =   await User.findByIdAndUpdate(
      { _id: data._id },
      { $set: { picture_url: "",  pic_public_id: "" } },
      { new: true }
    );
    if(doc){
res.json({
      success: true,
      message: "Your image has been deleted from the cloud",
    });
    }else{
        console.log(error.message);
       res.json({
      success: false,
      message: error.message,
    }); 
    }  
}else{
    res.json({success: false,message: result.result})
}
        }
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message: "Internal server error"});
    }
};
//get user details
const fetchProfile = async(req,res)=>{
   try {
    const user = await User.findById(req.user.id).select("-password")
    res.json({success: true, user_details: user })
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message:"Internal Server Error"});
  }

};


module.exports = {
    register,
    login,
    verifyUser,
    checkEmail,
    verifyOtp,
    resetPassword,
    editPatientProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    fetchProfile
}
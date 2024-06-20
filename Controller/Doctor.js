const bcrypt = require("bcryptjs")
const Doctor = require("../Model/Doctor");
const Appointments = require("../Model/Appointments");
const nodemailer = require("nodemailer");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDKEY,
    api_secret: process.env.CLOUDSECRET
});

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth:{
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});
//doctor sign-up
const register = async(req,res)=>{

    try {
        
        let check = await Doctor.findOne({email: req.body.email});
        if(check){
          return res.json({success: false,message: "Sorry a user with this email already exist"})
        }else{
            if (!req?.files?.signature)
      return res.json({success: false, message: "Please select an image"})
    const file = req.files.signature;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "doctors_signature",
    });
    if(result){
        const salt = await bcrypt.genSalt(10);
            const securePass = await bcrypt.hash("Test@12345",salt)
            doctor_info = await Doctor.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                dob: req.body.dob,
                password: securePass,
                gender: req.body.gender,
                postalCode: req.body.postalCode,
                studies_start_year: req.body.studies_start_year,
                studies_end_year: req.body.studies_end_year,
                special_recognition: req.body.special_recognition,
                specialist: req.body.specialist,
                location: req.body.location,
                phoneNo: req.body.phoneNo,
                clinic_hospital_address: req.body.clinic_hospital_address,
                about_info: req.body.about_info,
                signature_url: result.secure_url,
                signature_public_id: result.public_id
            });
            res.json({success:true,message: "Your form  request has been sent to the admin please wait for the account approval",doctor_info});
          }
            
        }
        
    } catch (error) {
        console.log(error.message);
       return res.json({success: true,message: error.message});
    }
};
//doctor login
const login = async(req,res)=>{
    const{email,password} = req.body;
    try {   
     const user = await Doctor.findOne({email});
     if(!user){
        return res.json({success:false,message: "Please try to login with correct email"})
     }
     const comparePass = await bcrypt.compare(password,user.password);
     if(!comparePass){
        return res.json({success:false,message: "Please try to login with correct password"});
     }
     if(user.account_approved ===  false){
  return  res.json({success: false,message: "Please wait for the account approval,you will receive the confirmation email"});
     }
       const data = {
      user: {
        id: user.id
      }
    }
       const token = jwt.sign(data,process.env.JWT_SECRET_KEY, { expiresIn: '15h' });
       res.json({success: true, message:"doctor logged in  successfully",token});

    } catch (error) {
        res.status(500).json({error: true,message: error.message})
    }
};

//generate token
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}
//otp expired
function isOTPExpired(createdAt){
    const expirationTime = moment(createdAt).add(10,"minutes")
    return moment()>expirationTime;
}
//verify otp code
const verifyOtp = async(req,res)=>{
    try {
    
        let user = await Doctor.findOne({otp: req.body.otp});
        if(!user){
         return  res.json({success:false, message: "code not found"})
        }else{
      const isExpired = isOTPExpired(user.updatedAt);
            if(isExpired){
                return res.json({success: false, message: "Your otp is expired"})
            }else{
                const data = await Doctor.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {otp: "", account_verified: true}},
                    {new: true});
                    res.json({success: true, message: "Your otp is verified", user: data._id});
            }
        }
        
    } catch (error) {
       return res.json({success:false, message: 'Internal server error'})
    }
};
//check email
const checkEmail = async(req,res)=>{
    try {
     const user = await Doctor.findOne({email: req.body.email});
     if(!user){
        return res.json({success:false, message: "Doctor with this email already exist"});
     }
  const otp = generateOTP();
           await Doctor.findByIdAndUpdate(
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


    } catch (error) {
      console.log(error.message);
       return  res.json({success: false, message: 'Internal Server error'})
    }
}
//reset password
const resetPassword = async(req,res)=>{
    try {
        const data = await Doctor.findOne({ _id: req.body.id });
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password, salt);
     const userData = await Doctor.findByIdAndUpdate(
      { _id: data._id },
      { $set: { password: securePass } },
      { new: true }
    );
    res.json({success: false, message: "Your password has been reset"});
    } catch (error) {
        console.log(error.message);
       return res.json({success: true, message: error.message})
    }
}

 const updateDoctorInfo = async(req,res)=>{
    const {id} = req.params;
    console.log(req.body);
    try {
        
       const user = await model.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({error: false,message: user});

    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }

 }

 const availability = async(req,res)=>{
  try {
   const data = await Doctor.findOne({_id: req.body.doctor_id});
   const result = await data.slots.includes(data);
   if(result === true){
   return res.json({success:  false,message: "Already this slot is  added"})
   }else{
    await Doctor.findByIdAndUpdate({
        _id: data._id
    },
    {
        $push: {slots: dataArray}
    },{new: true})
   }
   res.json({success: true,message: "Doctor time table added"});    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: error});
  }
 
};
//add reviews
const addReview = async(req,res)=>{
  try { 
  const data = await Doctor.findById({_id: req.body.doctorId});
    if (!data) {
      return res.json({success: false, message: "User not found"})
    }
    const reviewExists = data.reviews.some(review => review.doctorId.equals(req.body.doctorId));
    if (reviewExists) {
      return res.json({success: false, message: "Review by this user already exists"});
    }
    data.reviews.push(req.body);
    await data.save();
    return res.json({success: true, message: "Review saved successfully"});
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: error});
  }
};

//doctor details
 const fetchUserByID = async(req,res)=>{
   try {
    console.log(req.user.id);
    const doctor_details = await Doctor.findById(req.user.id).select("-password")
    res.json({success: true, doctor_details: doctor_details});
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message:"Internal Server Error"});
  }
 }
 //update profile picture
 const uploadProfilePicture = async(req,res)=>{
  try { 
if (!req?.files?.profile)
      return res.json({success:false, message: "Please upload an image"})
    const file = req.files.profile;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "doctor_profile",
    });
    console.log(result)
    if(result){
        const data = await Doctor.findByIdAndUpdate(
            {_id: req.body.id},
            {$set: {profile_public_id: result.public_id,picture_url: result.secure_url}},
            {new: true})
            res.json({success: true, message: "Profile picture updated"});
    }
  } catch (error) {
    console.log(error.message);
    res.json({success: false,message: "Internal Server error"});
  }
};
//delete profile picture
const deleteProfilePicture = async(req,res)=>{
    const {public_id} = req.body;
    try {
        const data = await Doctor.findOne({profile_public_id: public_id});
        if(!data){
             return res.json({success:false,message: "profile picture url does not exist"})
        }else{
const result =  await cloudinary.uploader.destroy(public_id);
if(result.result === 'ok'){

const doc =   await Doctor.findByIdAndUpdate(
      { _id: data._id },
      { $set: { profile_public_id: "",  picture_url: "https://res.cloudinary.com/duhiildi0/image/upload/v1717492663/user_mse9as.png" } },
      { new: true }
    );
    if(doc){
res.json({
      success:true,
      message: "Your image has been deleted from the cloud",
    });
    }else{
       res.json({
      success: false,
      message: "Your image has not been deleted from the cloud",
    }); 
    }  
}else{
    res.json({success: false,message: "Image not found"})
}
        }
    } catch (error) {
        console.log(error.message);
        res.json({success: false,message: 'Internal server error'});
    }
};
//fetch reviews
const getReviews = async(req,res)=>{
try {
   // const reviewId = req.params.reviewId;
   // const review = await Review.find().populate('doctorId');
     const review = await Review.find().populate({
      path: 'doctorId',
      select: '-password' // Exclude the password field
    }).exec();
    
    if (!review) {
      return res.json({success: false, message: 'Review not found'});
    }

    res.json({success: true, message: review});
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//delete reviews
const deleteReview = async(req,res)=>{
try {
    const reviewId = req.params.id;
    const result = await Review.findByIdAndDelete(reviewId);

    if (!result) {
      return res.json({success: false, message: 'Review not found'});
    }
    res.json({success: true, message: 'Review deleted successfully'});
  } catch (error) {
    console.log(error.message);
    res.json.send({success: false, message: 'Internal server error'});
  }
}
// delete specialities
const deleteDoctor = async(req,res)=>{
  try {
    
    const result = await Doctor.findByIdAndDelete(req.body.doctorId);
    if (!result) {
      return res.json({success: false, message: 'Doctor not found'});
    }
    res.json({success: true, message: 'Doctor deleted successfully'});
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//fetch all appointments
const fetchAppointmentByDoctor = async(req,res)=>{
  try {

    const data = await Appointments.find({patient: req.body.doctor});
    if(!data){
      return res.json({success: false, message: "Data not found"})
    }else{
     const appointments = await Appointments.find().populate('patient', '_id firstName lastName picture_url');
    
      const adminAmountsDict = {};
    appointments.forEach(appointment => {
    adminAmountsDict[appointment._id] = appointment.doctor_percentage_amount || 0;
  });
  let totalDoctorAmount = 0;
  appointments.forEach(appointment => {
    const adminAmount = adminAmountsDict[appointment._id] || 0;
    totalDoctorAmount += adminAmount;
  });
  res.json({success: true, total_earning: totalDoctorAmount,total_appointments: appointments.length,total_patients: appointments.length,appointments_list: appointments}); 
     
    
    }

   
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//Upcoming appointments
const upcomingAppointments = async(req,res)=>{
  try {
 
    const appointments = await Appointments.find({doctor: req.body.doctorId});
    if(!appointments){
      return res.json({success: false, message: "No appointments found"})
    }else{
 const today = moment().startOf('day').format('DD MMMM YYYY');
 console.log(today);
    // const todayDate = moment(today, 'DD MMMM YYYY').toDate();
    // console.log(todayDate);
    const upcomingAppointments = await Appointments.find({
      appointment_date: { $gte: today }
    });
    res.json({success: true, message: upcomingAppointments});
    }

  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}


module.exports = {
    register,
    login,
    verifyOtp,
    checkEmail,
    resetPassword,
    fetchUserByID,
    uploadProfilePicture,
    deleteProfilePicture,
    availability,
    addReview,
    getReviews,
    deleteReview,
    deleteDoctor,
    fetchAppointmentByDoctor,
    upcomingAppointments
}
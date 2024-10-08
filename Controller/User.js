const bcrypt = require("bcryptjs")
const User = require("../Model/User");
const Appointment = require("../Model/Appointments")
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const moment = require("moment");
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
  const otp = Math.floor(1000 + Math.random() * 9000);
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
           return  res.json({success:false,message: "Prova ad accedere con l'e-mail corretta"})
        }else{
    const otp = generateOTP();
        if(req.body.role === 'Patient'){
     const salt = await bcrypt.genSalt(10);
     const securePass = await bcrypt.hash(req.body.password,salt)
          check = await User.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
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
                text: `Hai richiesto la verifica dell'email. Il tuo codice OTP è ${otp}.
Scadrà fra 10 minuti. Se non riesci ad inserirlo può richiederne uno nuovo.

Grazie
Video Medico`
              //  text: `Your otp is: ${otp} will expire after 10 minutes`
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
                cv_public_id: result.public_id,
                "education": req.body.education,
                "university": req.body.university,
                "experience": req.body.experience
            });

             let mailOption = {
                from: process.env.SMTP_MAIL,
                to: "medicalvideovisit.noreply@gmail.com",
                subject: "Doctor form request for the account approval",
                text: `Hi admin!! this the Dr.${req.body.firstName}${req.body.lastName} and he is specialist in the ${req.body.specialist} so look his account on the admin portal thanks.`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
          return  res.json({success:false, message: error})
          }else{
            //account_approved: doctor_info.account_approved,role: doctor_info.role
          res.json({success:true,message: "Your form request has been sent to the admin please wait for the account approval"});
          }
            }); 
          }
        }
 }
    } catch (error) {
      console.log(error.message);
       return res.json({success:false,message: "Errore interno del server"});
    }
};
// user login
const login = async(req,res)=>{
    const { email, password, token } = req.body;
  try {
    let user = await User.findOne({email: email });
    if (!user) {
      return res.json({success: false, message: "Prova ad accedere con l'e-mail corretta" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.json({ success:false, message: "Prova ad accedere con la password corretta" });
    }
     if(user.account_verified === false){
      return res.json({success: false, message: "Per prima cosa verifica il tuo account", account_verified: user.account_verified});
     }
    const data = {
      user: {
        id: user.id
      }
    }
          const tokenData = await User.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {device_token: token}},
                    {new: true});
                    if(tokenData){
  const accessToken = jwt.sign(data,process.env.JWT_SECRET_KEY);
      // const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION;
       res.json({success: true,account_approved: user.account_approved, role: user.role,accessToken,id:user._id});
                    }
   
  } catch (error) {
     console.error(error.message);
     return res.json({success: false, message: 'Errore interno del server'});
  }
};
// verify patient
const verifyUser = async(req,res)=>{
    try {
        let user = await User.findOne({otp: req.body.otp});
        if(!user){
          return res.json({success:false, message: "Codice non trovato"})
        }else{
            if(req.body.role === "Patient"){
const isExpired = isOTPExpired(user.updatedAt);
            if(isExpired){
                 res.json({success:false, message: "Il tuo OTP è scaduto"})
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
       res.json({success: true, message:"Account verificato con successo",account_approved: true,accessToken});
            }
            }
        } 
    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: "Errore interno del server"})
    }
};
// check user email
const checkEmail = async(req,res)=>{
    try {
     const user = await User.findOne({email: req.body.email});
     if(!user){
        return res.json({success:false, message: "Non esistono utenti collegati a questa email"})
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
                  text: `Hai richiesto la verifica dell'email. Il tuo codice OTP è ${otp}.
Scadrà fra 10 minuti. Se non riesci ad inserirlo può richiederne uno nuovo.

Grazie
Video Medico`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
          return  res.json({success:false, message: error})
          }else{
            res.json({success:true, message: "Controlla la tua email, è stato inviato un codice."})
          }
            });          
     }
    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: 'Errore interno del server'})
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
    res.json({success:true, message: "La tua password è stata aggiornata con successo"});

    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: 'Errore interno del server'})
    }
}
//verify otp code
const verifyOtp = async(req,res)=>{
    try {
        let user = await User.findOne({otp: req.body.otp});
        if(!user){
         return  res.json({success:false, message: "Codice non trovato"})
        }else{
      const isExpired = isOTPExpired(user.updatedAt);
            if(isExpired){
                return res.json({success: false, message: "Il tuo OTP è scaduto"})
            }else{
                const data = await User.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {otp: "",account_approved: true}},
                    {new: true}).select("-password");
                    if(data){
  let mailOption = {
                from: process.env.SMTP_MAIL,
                to: data.email,
                subject: "Benvenuto su Video Medico",
                text: process.env.PATIENT_REGISTRATION
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
          return  res.json({success:false, message: error})
          }else{
           res.json({success: true, message:data});
          }
            }); 
                    }      
            }
        }
        
    } catch (error) {
      console.log(error.message);
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
        return res.json({success: false, message: "Errore interno del server"});
    }
}
//edit doctor profile 
const editDoctorProfile = async(req,res)=>{
   try {
        const user =  await User.findOne({_id: req.body.doctorId});
        if(user){
            const data = await User.findByIdAndUpdate(
        { _id: req.body.doctorId },
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
        "studies_start_year": req.body.studies_start_year,
        "studies_end_year": req.body.studies_end_year,
        "clinic_hospital_address": req.body.clinic_hospital_address,
        "specialist": req.body.specialist,
        "special_recognition": req.body.special_recognition
          },
        },
        { new: true }
      );
       res.json({success: true, user_details: data})
        }
        
    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: "Errore interno del server"});
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
    //res.json({success: true, message: result,id: req.body.Id})
    if(result){
        const data = await User.findByIdAndUpdate(
            {_id: req.body.Id},
            {$set: {pic_public_id: result.public_id,picture_url: result.secure_url}},
            {new: true})
            res.json({success: true, message: data})
    }
  } catch (error) {
    console.log(error.message);
    res.json({success: false,message: 'Errore interno del server'});
  }
};
//delete profile picture
const deleteProfilePicture = async(req,res)=>{
    try {
     
        const data = await User.findOne({pic_public_id: req.body.public_id});
        if(!data){
             return res.json({success: false,message: "pic_public_id non esiste"})
        }else{
          console.log(data);
const result =  await cloudinary.uploader.destroy(req.body.public_id);
if(result.result === 'ok'){

const doc =   await User.findByIdAndUpdate(
      { _id: data._id },
      { $set: { picture_url: "",  pic_public_id: "" } },
      { new: true }
    );
    if(doc){
res.json({success: true, message: doc});
    }else{
        console.log(error.message);
       res.json({success: false, message: error.message}); 
    }  
}else{
    res.json({success: true,message: result.result})
}
        }
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message: 'Errore interno del server'});
    }
};
//get user details
const fetchProfile = async(req,res)=>{
   try {
    const user = await User.findById(req.user.id).select("-password")
    res.json({success: true, user_details: user })
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message: "Errore interno del server"});
  }

};
//patient medical history form 
const patientMedicalHistory = async(req,res)=>{
    try {
        const user =  await User.findOne({_id: req.body.patientId});
        if(user){
            const data = await User.findByIdAndUpdate(
        { _id: req.body.patientId },
        {
          $set: {
        "good_health": req.body.good_health,
        "serious_illness": req.body.serious_illness,
        "serious_illness_description" : req.body.serious_illness_description,
        "past_surgery": req.body.past_surgery,
        "past_surgery_description": req.body.past_surgery_description,
        "current_medication": req.body.current_medication,
        "current_medication_description": req.body.current_medication_description,
        "heart_disease": req.body.heart_disease,
        "blood_pressure": req.body.blood_pressure,
        "allergies": req.body.allergies,
        "allergies_description": req.body.allergies_description,
        "diabetes": req.body.diabetes,
        "kidney_disease": req.body.kidney_disease,
        "thyroid": req.body.thyroid,
        "stomach_disease": req.body.stomach_disease,
        "digestive_disease": req.body.digestive_disease,
        "digestive_description": req.body.digestive_description,
        "lung_disease": req.body.lung_disease,
        "lungs_description": req.body.lungs_description,
        "venereal": req.body.venereal,
        "nervous": req.body.nervous,
        "hormone": req.body.hormone,
        "any_illness": req.body.any_illness,
        "any_illness_description": req.body.any_illness_description,
        "smoke": req.body.smoke,
        "alcohol": req.body.alcohol,
        "aids": req.body.aids,
        "usual_medicine": req.body.usual_medicine,
        "usual_medicine_description": req.body.usual_medicine_description,
          },
        },
        { new: true }
      );
       res.json({success: true, user_details: data})
        }
        
    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: "Errore interno del server"});
    }
}
//upload doctor signature 
 const uploadSignaturePicture = async(req,res)=>{
  try { 
if (!req?.files?.signature)
      return res.json({success: false, message: "Please upload an image"})
    const file = req.files.signature;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "signature",
    });
    console.log(result)
    if(result){
        const data = await User.findByIdAndUpdate(
            {_id: req.body.doctorId},
            {$set: {signature_public_id: result.public_id,signature_url: result.secure_url}},
            {new: true})
            res.json({success: true, user_details: data});
    }
  } catch (error) {
    console.log(error.message);
    res.json({success: false,message: "Errore interno del server"});
  }
};
//patient dashboard
const getAllDoctors = async(req,res)=>{
  try {
     const doc = await User.find({role: req.body.role});
   if(doc){
      res.json({success: true, doctors_list: doc})
   }
    
  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: "Errore interno del server"});
  }
}
// delete specialists
const deleteDoctor = async(req,res)=>{
  try {
    
    const result = await User.findByIdAndDelete(req.body.doctorId);
    if (!result) {
      return res.json({success: false, message: 'Doctor not found'});
    }
    res.json({success: true, message: 'Doctor deleted successfully'});
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//post favorite
const postFavorite = async(req,res)=>{
  try { 
  const data = await User.findById({_id: req.body.doctorId});
    if (!data) {
      return res.json({success: false, message: "Utente non trovato"})
    }
    const favExists = data.favorites.some(fav => fav.doctorId.equals(req.body.doctorId));
    if (favExists) {
      return res.json({success: false, message: "Favorite by this user already exists"});
    }
    data.favorites.push(req.body);
    await data.save();
    return res.json({success: true, message: "Preferito salvato con successo"});
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Errore interno del server'});
  }
};
// get favorites
const getFavorites = async(req,res)=>{
  try {
     const favorites = await User.find({role: req.body.role}).select("-password");
    res.json({success: true, message: favorites});
    } catch (error) {
        console.log(error.message);
      return  res.json({success:false, message: 'Errore interno del server'});
    }
}
//remove favorite
const removeFavorite =async(req,res)=>{
  try {
        const {doctorId} = req.body;
       const doc = await User.findByIdAndUpdate(
      doctorId,
      { $unset: { favorites: "" } },
      { new: true }
    ).populate('favorites');
    if (doc) {
      res.json({success: true, message: doc});
    } else {
      res.json({success: false, message: "Preferiti non trovati"});
    }
    
  } catch (error) {
    console.log(error.message);
    return res.json({success:false, message: "Errore interno del server"})
  }
}
// add reviews
const addReviews = async(req,res)=>{
  try {
     const data = await User.findOne({_id: req.body.doctorId});
    if (!data) {
      return res.json({success: false, message: "Utente non trovato"})
    }
    const reviewExists = data.reviews.some(review => review.patientId.equals(req.body.patientId));
    if (reviewExists) {
       averageRating(req.body.doctorId)
      return res.json({success: false, message: "La recensione di questo utente esiste già"});
    }
    data.reviews.push(req.body);
   const doc = await data.save();
   if(doc){
    averageRating(req.body.doctorId)
   }
    return res.json({success: true, message: "Recensione salvata con successo"}); 
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Errore interno del server"});
  }
}
// delete review 
const deleteReview = async(req,res)=>{
  try {
      const {doctorId, reviewId} = req.body;
     const user = await User.findByIdAndUpdate(
      doctorId,
      { $pull: { reviews: { _id: reviewId } } },
      { new: true }
    );
    if (user) {
      res.json({success: true, message: user.reviews});
    } else {
      res.json({success: false, message: "Review not found"});
    }
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
// average rating and total reviews
const averageRating = async(doctorId)=>{ 
  try {
    const users = await User.findOne({_id: doctorId });
const reviewCount = users.reviews.length;
const totalRating = users.reviews.reduce((sum, review) => sum + review.rating, 0);
   await User.findByIdAndUpdate(
    doctorId,
    {$set: {total_reviews: reviewCount, average_rating: totalRating}},
    {new: true}
   )
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Errore interno del server"});
  }
  
}
//add slots
const addSlots = async(req,res)=>{
  try { 
    const doc = await User.findOne({_id: req.body.doctorId});
    const {time,date} = req.body;
     if(doc){
    const user = await User.findByIdAndUpdate(
      req.body.doctorId,
      { $push: { slots: { time, date } } },
      { new: true }
    );
    user.visit = req.body.visit,
    user.followUp = req.body.followUp,
    user.currency = req.body.currency
      const data = await user.save();
      if(data){
        return res.json({success: true, user_details: data});
      }
     }
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Errore interno del server'});
  }
};
//Get slots
 const getSlots = async(req,res)=>{
  try {
    const slot = await User.findOne({_id: req.body.doctorId});
    //console.log(slot.reviews);
     if(slot){
     res.json({success: true, appointment_details: slot});
     }else{
      res.json({success: false, message: "Dati non trovati"});
     }
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Errore interno del server'});
  }
 }
 //get doctor details
 const doctorProfile = async(req,res)=>{
   try {
    const user = await User.findOne({_id: req.body.doctorId}).select("-password")
    res.json({success: true, doctor_details: user })
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message:"Errore interno del server"});
  }
};
// get patient details
const patientProfile = async(req,res)=>{
   try {
    const user = await User.findOne({_id: req.body.patientId}).select("-password")
    res.json({success: true, patient_details: user })
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message:"Errore interno del server"});
  }
};

// doctor dashboard
const doctorDashboard = async(req,res)=>{
  try {
    const {doctorId} = req.body;
    const doc = await User.findOne({_id: doctorId});
    if(!doc){
  return res.json({success: false, message: "Dati non trovati"})
    }
    else{
      const appointments = await Appointment.find({doctor: doctorId}).populate('patient','_id firstName lastName picture_url default_picture_url postal_code sex dob location phoneNumber good_health serious_illness serious_illness_description past_surgery past_surgery_description current_medication current_medication_description heart_disease blood_pressure  allergies allergies_description diabetes kidney_disease thyroid stomach_disease  digestive_disease  digestive_description lung_disease lungs_description venereal nervous hormone any_illness any_illness_description smoke alcohol aids usual_medicine usual_medicine_description')

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
    res.json({success: false, message: 'Errore interno del server'})
  }
}
// add Meeting
 const addMeeting = async(req,res)=>{
  try { 
    const {doctorId,roomId} = req.body;
  const data = await User.findByIdAndUpdate(
            {_id: doctorId},
            {$set: {meeting: roomId}},
            {new: true})
            res.json({success: true, message: "L'ID della Televisita è salvato"});
  } catch (error) {
    console.log(error.message);
    res.json({success: false,message: "Errore interno del server"});
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
    fetchProfile,
    patientMedicalHistory,
    uploadSignaturePicture,
    getAllDoctors,
    postFavorite,
    getFavorites,
    removeFavorite,
    addReviews,
    addSlots,
    getSlots,
    doctorProfile,
    patientProfile,
    doctorDashboard,
    editDoctorProfile,
    addMeeting
}
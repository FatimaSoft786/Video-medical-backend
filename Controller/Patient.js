const bcrypt = require("bcryptjs")
const doctor = require("../Model/Doctor");
const nodemailer = require("nodemailer");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Patient = require("../Model/Patient");
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
})



function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

const register = async(req,res)=>{
    try {
        let check = await Patient.findOne({email: req.body.email});
        if(check){
           return  res.json({success:false,message: "Sorry a patient with this email already exist"})
        }else{
            const salt = await bcrypt.genSalt(10);
            const securePass = await bcrypt.hash(req.body.password,salt)
         //   const otp = generateOTP();
            check = await Patient.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: securePass,
                phoneNumber: req.body.phoneNumber,
              //  otp: otp,
                role: "Patient"
            });
            res.json({success: true, message: "you are register successfully"});
          //   let mailOption = {
          //       from: process.env.SMTP_MAIL,
          //       to: req.body.email,
          //       subject: "Otp verification",
          //       text: `Your otp is: ${otp} will expire after 10 minutes`
          //   };
          //   transporter.sendMail(mailOption,function(error){
          // if(error){
          //  return  res.json({success:false,message: error})
          // }else{
          //   res.json({success: true,message: "Please check your email code has be sent on the email."})
          // }
          //   });
        }
        
    } catch (error) {
      console.log(error.message);
       return res.json({success:false,message: "Internal server error"});
    }
};

const login = async(req,res)=>{
    const { email, password } = req.body;
  try {
    let user = await Patient.findOne({ email });
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
       const token = jwt.sign(data,process.env.JWT_SECRET_KEY, { expiresIn: '15h' });
       res.json({success: true, message:"user logged in  successfully",token});
   
  } catch (error) {
     console.error(error.message);
     return res.json({success: false, message: 'Internal server error'});
  }
};

function isOTPExpired(createdAt){
    const expirationTime = moment(createdAt).add(10,"minutes")
    return moment()>expirationTime;
}

const verifyOtp = async(req,res)=>{
    try {
      console.log(req.body);
        const user = await Patient.findOne({otp: req.body.otp});
        if(!user){
          return res.json({success:false, message: "Code not found"})
        }else{
 const isExpired = isOTPExpired(user.updatedAt);
            if(isExpired){
                 res.json({success:false, message: "Your otp is expired"})
            }else{
                const data = await Patient.findByIdAndUpdate(
                    {_id: user._id},
                    {$set: {otp: "", account_verified: true}},
                    {new: true});
                    res.json({success:true, message: "Your otp is verified", user: data._id});
            }
        }
        
    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: error.message})
    }
};

const checkEmail = async(req,res)=>{
    try {
     const user = await Patient.findOne({email: req.body.email});
     if(!user){
        return res.json({success:false, message: "User with this email does not exist"})
     }else {
        const otp = generateOTP();
           await Patient.findByIdAndUpdate(
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

const resetPassword = async(req,res)=>{
    try {
        const data = await Patient.findOne({ _id: req.body.id });
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password, salt);
     const userData = await Patient.findByIdAndUpdate(
      { _id: data._id },
      { $set: { password: securePass } },
      { new: true }
    );
    res.json({success:true, message: "Your password has been updated"});

    } catch (error) {
      console.log(error.message);
       return res.json({success:false, message: 'Internal server error'})
    }
}

const likeDoctor = async(req,res)=>{
    try {
  const {patientID,doctorID} = req.body;
   const data = await model.findOne({_id: patientID});
   const result = await data.favorite.includes(doctorID);
   if(result === true){
    res.status(400).json({error:  false,message: "Already available in the favorite list"})
   }else{
    await model.findByIdAndUpdate({
        _id: data._id
    },
    {
        $push: {favorite: doctorID}
    },{new: true})
   }
   res.status(200).json({error: false,message: "Doctor added in the Favorite"});
        
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
};

const unlikeDoctor = async(req,res)=>{
    try {
  const {patientID,doctorID} = req.body;
   const data = await model.findOne({_id: patientID});
   const result = await data.favorite.includes(doctorID);
   if(result === true){
       await model.findByIdAndUpdate({
        _id: data._id
    },
    {
        $pull: {favorite: doctorID}
    },{new: true});
    res.status(200).json({error: false,message: "Removed from your Favorites"});
   }else{
    res.status(200).json({error: false,message: "Favorite is empty"})
   }       
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
};

const uploadPatientData = async(req,res)=>{
  try { 
  console.log(req.body);

if (!req?.files?.image)
      return res.status(400).json({error: true, message: "Please upload an image"})
    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "patient_profile",
    });
    console.log(result)
    if(result){

const data = await model.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "email": req.body.email,
        "phoneNumber": req.body.phoneNumber,
        "dob": req.body.dob,
        "location": req.body.location,
        "postal_code": req.body.postal_code,
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
        "sex": req.body.sex,
        "pic_public_id": result.public_id,
        "picture_url": result.secure_url
          },
        },
        { new: true }
      );
      res.status(200).json(data)
    }
  } catch (error) {
    res.status(500).json({error: true,message: error.message});
  }
};

const fetchProfile = async(req,res)=>{
   try {
    const user = await Patient.findById(req.user.id).select("-password")
    res.json({success: true, patient_details: user })
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message:"Internal Server Error"});
  }

};

const deletePicture = async(req,res)=>{
    try {
        const data = await model.findOne({pic_public_id: req.body.public_id});
        if(!data){
             return res.status(400).json({error: true,message: "Profile picture url does not exist"})
        }else{
const result =  await cloudinary.uploader.destroy(req.body.public_id);
if(result.result === 'ok'){
  const doc =   await model.findByIdAndUpdate(
      { _id: data._id },
      { $set: { picture_url: "",  pic_public_id: "" } },
      { new: true }
    );
    if(doc){
res.status(200).json({
      error: false,
      message: "Your image has been deleted from the cloud",
    });
    }else{
       res.status(400).json({
      error: false,
      message: "Your image has not been deleted from the cloud",
    }); 
    } 
}else{
    res.status(400).json({error: true,message: result.result})
}
        }
 
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
};

 const updatePatientInfo = async(req,res)=>{
    const {id} = req.params;
    try {
       const user = await model.findByIdAndUpdate(id, req.body, { new: true });
       res.status(200).json({error: false,message: user});
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
 };

 const uploadHistoryPicture = async(req,res)=>{
  try { 
if (!req?.files?.image)
      return res.status(400).json({error: true, message: "Please upload an image"})
    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "image",
      folder: "patient_history",
    });
    console.log(result)
    if(result){
        const data = await model.findByIdAndUpdate(
            {_id: req.body.id},
            {$set: {history_public_id: result.public_id,history_doc_url: result.secure_url}},
            {new: true})
            res.status(200).json({error: false, message: "Image uploaded on the cloud"})
    }
  } catch (error) {
    res.status(500).json({error: true,message: error.message});
  }
};

const deleteHistoryPicture = async(req,res)=>{
    try {
        const data = await model.findOne({history_public_id: req.body.public_id});
        if(!data){
             return res.status(400).json({error: true,message: "history picture url does not exist"})
        }else{
const result =  await cloudinary.uploader.destroy(req.body.public_id);
if(result.result === 'ok'){

const doc =   await model.findByIdAndUpdate(
      { _id: data._id },
      { $set: { history_doc_url: "",  history_public_id: "" } },
      { new: true }
    );
    if(doc){
res.status(200).json({
      error: false,
      message: "Your image has been deleted from the cloud",
    });
    }else{
       res.status(400).json({
      error: false,
      message: "Your image has not been deleted from the cloud",
    }); 
    }  
}else{
    res.status(400).json({error: true,message: result.result})
}
        }
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
};

const likedDoctorByPatient = async(req,res)=>{
  try {

    const doc = await model.findOne({_id: req.body.id});

    if(doc){
    res.status(200).json({error: false, message: doc})
     for(i =0; i<doc.favorite.length; i++){
    
     //  console.log(doc.favorite[i]);
     // const doctorDoc = await doctor.find({_id: doc.favorite[i]})
      // res.status(200).json({error: false, data: doctorDoc})
     }
    }else{

     if(doc){
      res.status(200).json({error: false, message: doc})
    // for(i =0; i<doc.favorite.length; i++){
    //   const doctorDoc = await doctor.find({_id: doc.favorite[i]})
    //   res.status(200).send({error: false, data: doctorDoc})
    // }
     }
     else{
      res.status(200).json({error: false, message: "Data not found"})
     }
    } 
  } catch (error) {
    res.status(500).json({error: true, message: error.message})
  }
}
 


module.exports = {
    register,
    login,
    verifyOtp,
    checkEmail,
    resetPassword,
    likeDoctor,
    unlikeDoctor,
    uploadPatientData,
    deletePicture,
    updatePatientInfo,
    uploadHistoryPicture,
    deleteHistoryPicture,
    likedDoctorByPatient,
    fetchProfile
}



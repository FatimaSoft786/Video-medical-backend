const Recording = require("../Model/Recording");
//cloudinary
const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDKEY,
    api_secret: process.env.CLOUDSECRET
});
 const uploadRecording = async(req,res)=>{
  try { 
if (!req?.files?.recording)
      return res.json({success: false, message: "Per favore, carica una registrazione"})
    const file = req.files.recording;
    console.log(file);
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: file.name,
      resource_type: "video",
      folder: "recordings",
    });
    console.log(result)
    if(result){

        const data = await Recording.create({
            recording: result.secure_url,
            recordDate: req.body.date
        });
        console.log(data);
     

   res.json({success: true, message: data});
    }
  } catch (error) {
    console.log(error.message);
    res.json({success: false,message: "Errore interno del server"});
  }
};

const fetchRecordings = async(req,res)=>{
    try {
        const data = await Recording.find();
        res.json({success: true, recordings: data});
    } catch (error) {
        res.json({success: false,message: "Errore interno del server"});
    }
}

module.exports = {
    uploadRecording,
    fetchRecordings
}
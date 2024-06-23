const Slot = require("../Model/Slots");
const User = require("../Model/User");

//add slots
const addSlots = async(req,res)=>{
  try { 
   
    const doc = await User.findOne({_id: req.body.doctorId});
    if(doc){
          const userData = await User.findByIdAndUpdate(
      { _id: doc._id },
      { $set: { visit: req.body.visit,followUp: req.body.followUp, currency: req.body.currency }},
      { new: true }
    );
     if(userData){
        const data = Slot.create({
         doctor: req.body.doctorId,
         time: req.body.time,
         date: req.body.date
        })
          res.json({success: true, message: "Slot saved successfully"}); 
    }
    }
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
};
//Get slots
 const getSlots = async(req,res)=>{
  try {
    const slot = await Slot.find({doctor: req.body.doctorId}).populate('doctor','_id firstName lastName default_picture_url specialist');
     if(slot){
     res.json({success: true, appointment_details: slot});
     }else{
      res.json({success: false, message: "No data found"});
     }
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Internal Server error'});
  }
 }


module.exports = {
    addSlots,
    getSlots
};

const Favorite = require("../Model/Favorite");
const doctor = require("../Model/Doctor");
const Fav = async(req,res)=>{
      try {
  const {patientId,doctorId} = req.body;

   const existingFavorite = await Favorite.findOne({patientId,doctorId});
   if(existingFavorite){
    return res.status(400).json({error: true, message: "Doctor already exist"})
   }

  const data = await Favorite.create({
       "doctorId": doctorId,
        "patientId": patientId,
         "liked": true
  });
      res.status(200).json({error: false, message: data}); 
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
}


const fetch = async(req,res)=>{
    try {

        const data = await Favorite.find({patientId: {$in: req.body.Id}});
        res.status(200).json({error: false, favorite: data.doctorId});
        
    } catch (error) {
        res.status(500).json({error: true, message: error.message});
    }
}


module.exports ={
    Fav,
    fetch
};
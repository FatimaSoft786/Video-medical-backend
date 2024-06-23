const Favorite = require("../Model/Favorite");
const Fav = async(req,res)=>{
      try {
  const {patientId,doctorId} = req.body;
   const existingFavorite = await Favorite.findOne({patient: patientId,doctor: doctorId});
   if(existingFavorite){
    return res.json({success:false, message: "Doctor already is in favorite"})
   }

  const data = await Favorite.create({
       "doctor": doctorId,
        "patient": patientId
  });
      res.json({success: true, message: data}); 
    } catch (error) {
        console.log(error.message);
      return  res.json({success: true,message: "Internal server error"});
    }
}


const fetchFavorites = async(req,res)=>{
    try {

          const data = await Favorite.find({patient: req.body.patientId});
    if(!data){
      return res.json({success: false, message: "Data not found"})
    }else{
     const favorites = await Favorite.find().populate('doctor', '_id firstName lastName picture_url slots reviews');
    res.json({success: true, total_favorites: favorites.length,favorites_list: favorites}); 
    }
        
    } catch (error) {
        console.log(error.message);
      return  res.json({success:false, message: error.message});
    }
}

const deleteFavorite = async(req,res)=>{
    try {
    const data = await Favorite.findByIdAndDelete({_id: req.body.id});
    res.json({success: true, message: "Doctor removed from favorite successfully"});
        
    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: "Internal server error"});
    }
}

module.exports ={
    Fav,
    fetchFavorites,
    deleteFavorite
};
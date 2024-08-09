const Review = require("../Model/Reviews");

//add reviews
const addReview = async(req,res)=>{
  try { 
   
  const data = await Review.findOne({patientId: req.body.patientId});
    if (data) {
      return res.json({success: false, message: "Recensione trovata"})
    }else{
     const review = new Review(req.body);
    await review.save();
     res.json({success: true, message: "Recensione salvata con successo"});
    }
    // const reviewExists = data.reviews.some(review => review.doctorId.equals(req.body.doctorId));
    // if (reviewExists) {
    //   return res.json({success: false, message: "Review by this user already exists"});
    // }
    //data.reviews.push(req.body);
     
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Errore interno del server"});
  }
};
//reviews list
 const reviews = async(req,res)=>{
  try {
    const review = await Review.find().populate('doctor','_id firstName lastName default_picture_url picture_url specialist').populate('patient','_id firstName lastName default_picture_url picture_url');
     if(review){
     res.json({success: true, reviews_list: review});
     }else{
      res.json({success: false, message: "Dati non trovati"});
     }
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Errore interno del server'});
  }
 }
 //delete reviews
const deleteReview = async(req,res)=>{
try {
    const reviewId = req.params.id;
    const result = await Review.findByIdAndDelete(reviewId);

    if (!result) {
      return res.json({success: false, message: 'Recensione non trovata'});
    }
    res.json({success: true, message: 'Review deleted successfully'});
  } catch (error) {
    console.log(error.message);
    res.json.send({success: false, message: 'Errore interno del server'});
  }
}

//reviews by doctor idd
 const reviewByDoctorID = async(req,res)=>{
  try {
    const review = await Review.find({doctor: req.body.doctorId}).populate('doctor','_id firstName lastName default_picture_url specialist').populate('patient','_id firstName lastName picture_url');
     if(review){
     res.json({success: true, reviews_list: review});
     }else{
      res.json({success: false, message: "Dati non trovati"});
     }
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: 'Errore interno del server'});
  }
 }

module.exports = {
    addReview,
    reviews,
    deleteReview,
    reviewByDoctorID
};

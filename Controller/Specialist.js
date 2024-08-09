const Specialist = require("../Model/Specialist");
const doctors = require("../Model/Doctor");

const addSpecialist = async(req,res)=>{
    const {specialist} = req.body;
    try {
        let check = await Specialist.findOne({specialist: req.body.specialist});
            check = await Specialist.create({
                specialist: specialist,
            });
         res.json({success: true, message: check})
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false,message: "Errore interno del server"});
    }
};

const getSpecialists = async(req,res)=>{
    try {
       let check = await Specialist.find();
       res.json({success:true, total_specialist_category: check.length, specialists: check})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Errore interno del server"});
    }
};

const fetchDoctors =async(req,res)=>{
    try {
        const {firstName,specialist,lastName} = req.body;
        const docs = await doctors.find({
            $or: [
                {firstName: {$regex: `${firstName}`, $options: 'i'}},
                {lastName: {$regex: `${lastName}`, $options: 'i'}},
                {specialist: {$regex: `${specialist}`, $options: 'i'}}
            ]
        })

        res.json.json({success: true, doctors: docs})
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false,message: "Errore interno del server"});
    }
}

const fetchAllDoctors = async(req,res)=>{
     try {
        
        const doc = await doctors.find();
        res.status(200).json({error: false,doctors: doc})
        
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
}


module.exports = {
    addSpecialist,
    getSpecialists,
    fetchDoctors,
    fetchAllDoctors
}
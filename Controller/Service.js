const model = require("../Model/DoctorServices");
const doctors = require("../Model/Doctor");

const service = async(req,res)=>{
    const {doctor_service} = req.body;
    try {
        let check = await model.findOne({doctor_service: doctor_service});
            check = await model.create({
                doctor_service: doctor_service,
            });
         res.status(200).json({error: false, message: check})
        
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
};

const getServices = async(req,res)=>{
    try {
       let check = await model.find();
       res.status(200).json({error: false,services: check})
    } catch (error) {
        res.status(500).json({error: false, message: error.message});
    }
};

const fetchDoctors =async(req,res)=>{
    try {
        const {firstName,specialist,lastName} = req.body;

    //    const doc = await doctors.find({
    //         firstName: { $regex: `^${firstName}$`, $options: '' }, // Case-sensitive search
    //         lastName: { $regex: `^${lastName}$`, $options: '' },
    //         specialist: { $regex: `^${specialist}$`, $options: '' },
    //     });

        const docs = await doctors.find({
            $or: [
                {firstName: {$regex: `${firstName}`, $options: 'i'}},
                {lastName: {$regex: `${lastName}`, $options: 'i'}},
                {specialist: {$regex: `${specialist}`, $options: 'i'}}
            ]
        })

        res.status(200).json({error: false, doctors: docs})
        
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
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
    service,
    getServices,
    fetchDoctors,
    fetchAllDoctors
}
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery",false);

const connectToMongo = () =>{
    mongoose.connect(process.env.DATABASE)
    .then((data)=>{
        console.log("connection established")
    }).catch((err)=>{
        console.log(err)
    })
}
module.exports = connectToMongo
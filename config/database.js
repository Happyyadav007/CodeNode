// const mongoose = require("mongoose");
// require("dotenv").config();

// mongoose
//   .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("Database connected successfully"))
//   .catch((error) => {
//     console.error("Database connection failed", error);
//   });

//const MONGO_URL = "mongodb://localhost:27017/StudyNotionDB";

const mongoose = require("mongoose"); 
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(() => console.log("DB Connected Successfully"))
    .catch( (error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    } )
};
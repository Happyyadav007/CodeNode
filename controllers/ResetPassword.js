const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');
const crypto = require("crypto");

//reset password token

exports.resetPasswordToken = async (req, res) =>{
    try{
          //fetch email
    const {email} = req.body;
    //check user for email
    const user = await User.findOne({email:email});
    if(!user){
        return res.status(404).json({
            success:false,
            message:'User does not exist',
        })
    }
    //generate token
    const token = crypto.randomBytes(20).toString("hex");
    //update user by adding token and expiration time
    const updateDetails = await User.findOneAndUpdate({email:email},
        {
            token:token,
            resetPasswordExpires:Date.now() + 5*60*60*1000,
        },
        {new:true});
        console.log("details:", updateDetails);
        //create url
        const url = `http://localhost:3000/update-password/${token}`;
        //send mail containg url
        await mailSender(email,"Password Reset Link",
            `Password Reset Link:${url}`
        );
        //return response
        return res.status(200).json({
            success:true,
            message:"Email send successfully. Please check email",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Something went wrong while resetting password',
        })
    }
  }
  //reset password
  exports.resetPassword = async (req,res) => {
   try{
     //data fetch
     const {password, confirmPassword, token} = req.body;
     //validation
     if( password !== confirmPassword){
         return res.json({
             success:false,
             message:'Password not matching',
         })
     }
     //get userdetails from db
     const userdetails = await User.findOne({token:token});
     //if no entry
     if(!userdetails){
         return res.json({
             success:false,
             message:'Token is invalid',
         });
     }
     //check token expiry time
     if(userdetails.resetPasswordExpires < Date.now()){
         return res.json({
             success:false,
             message:'Token is Expired. Please regenerate.',
         })
     }
     //hash passwoord
     const hashedPassword = await bcrypt.hash(password, 10);
     //update password
     await User.findOneAndUpdate(
         {token:token},
         {password:hashedPassword},
         {new:true},
     );
     return res.json({
         success:true,
         message:'Password reset Successful',
     })
   }catch(error) {
    return res.json({
        success:false,
        message:'someting went wrong while reseting',
    });
   }
}
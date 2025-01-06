const User = require("../models/User");
const Profile = require("../models/Profile")
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const  jwt = require("jsonwebtoken");
require("dotenv").config();

//sendotp

exports.sendOTP = async (req,res) =>{
    try {
    const {email} = req.body;
    //check if user is present
    const checkUserPresent = await User.findOne({email: email});
    if(checkUserPresent){
        return res.status(401).json({
            success: false,
            message:"User already exist",
        })
    }
    //generate otp
    var otp = otpGenerator.generate(6, {
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    })
    console.log("otp generated: ", otp);
    let result = await OTP.findOne({otp:otp});
    while(result){
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        result = await OTP.findOne({otp:otp});
    }
    //create an otp entry on DB
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successful
    res.status(200).json({
        success:true,
        message:'OTP sent successfully',
        otp,
    })
}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:error.message,
    })
}
}

//signup

exports.signup = async (req, res) => {
    //data fetch
   try{
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body;
    //validate
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:'All fields are required',
        })
    }
    //password match
    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:'Password and confirmPassword does not matched',
        })
    }
    //check user already exist or not
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:'User is already registered',
        })
    }
    //find most recent otp stored for user
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log("recentOtp", recentOtp);

    //validate otp
    if(recentOtp.length == 0){
        return res.status(400).json({
            success:false,
            message:'otp not found',
        })
    }
    else if(otp !=  recentOtp[0].otp){

        console.log(recentOtp[0].otp, otp);
        //invalid otp
        return res.status(400).json({
            success:false,
            message:'otp does not matched',
        })
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

     //entry create in DB
     const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
     })
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
		});
    //     image: `https://api.dicebear.com/5.x/intials/svg?seed=${firstName}${lastName}`,
    // })
    return res.status(200).json({
        success:true,
        messsage:'User is registered Successfully',
        user,
    });
   }
   catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'User can not be registered. Please try again',
    })
   }
}

//signin

exports.login = async (req,res) =>{
    //match the password
    try{
        const {email, password} = req.body;
        console.log(1);
        //validate
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"Please fill all fields",
            })
        }
        //check user exist or not
        const user = await User.findOne({email: email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User does not exist. Please signup.",
            })
        }
        console.log("user", user);
        //match the password
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user.id,
                accountType: user.accountType,
            }
             //create jwt token
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;
            //create cookie
            const options = {
                expires:new Date(Date.now() + 2*60*60*1000),
                httpOnly :true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in Successfully',
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            })
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Login failure, Please try again!",
        })
    }
}

//change password

//isAdmin

//isStudent

//isInstructor
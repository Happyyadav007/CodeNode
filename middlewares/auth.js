const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req,res,next) =>{
    try{
        //extract jwt token
        console.log("cookies", req.cookies.token);
        console.log("body", req.body.token);
        //console.log("header", req.header("Authorization"));
        // const token = req.body.token;
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", '');
        if(!token){
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }
        //verify token
        try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decode);
        req.user = decode;
        }
        catch(error) {
            res.status(401).json({
                success:false,
                message: "Invalid token",
            })
        }
        next();
    } catch(error){
        return res.status(401).json({
            success:false,
            message:"something went wrong",
        })
    }
}

exports.isStudent = (req,res,next) => {
    try{
        if(req.user.role !== "Student"){
            return res.status(401).json({
                success:false,
                message:'this is a protected route for students',
            })
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'user role is not matching',
        })
    }
}


exports.isAdmin = (req,res,next) => {
    try{
        if(req.user.role !== "Admin"){
            return res.status(401).json({
                success:false,
                message:'this is a protected route for admins',
            })
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'user role is not matching',
        })
    }
}
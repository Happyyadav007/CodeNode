const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//signup route handler
exports.signup = async (req, res) => {
    try{
        //get data
        const {name,email,password,role} = req.body;
        const existingUser = await User.findOne({email});
        //check user exist
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'user already exist',
            });
        }
        //secure password
        let hashedPassword;
        try{
            hashedPassword = await bcrypt.hash(password, 10);

        }
        catch(err){
            return res.status(500).json({
                success:false,
                message:"error in hashing password",
            })
        }
        //create entry for user
        const user = await User.create({
            name,email,password:hashedPassword,role
        })
        return res.status(200).json({
            success:true,
            message:"user created Sucessfully",
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: 'User cannot be registered, please try again later',
        })
    }
}
    exports.login = async (req,res) =>{
        try{
            //data fetch
            const {email,password} = req.body;
            //validate
            if(!email || !password){
                return res.status(400).json({
                    success: false,
                    message:'Please fill all the details',
                });
            }
            //check user exist
            const user = await User.findOne({email});
            //if not registered
            if(!user){
                return res.status(401).json({
                success:false,
                message:"user does not exist"
                });
            }
            let payload = {
                email:user.email,
                id:user._id,
                role:user.role,
            };
            //verify password & generate a JWT  token
            if(await bcrypt.compare(password,user.password)){
                //password match
                let token = jwt.sign(payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn:"2h",
                    }
                )
                // user = user.toObject();
                user.token = token; 
                user.password = undefined;
                const options = {
                    expires : new Date(Date.now() + 30 * 1000),
                    httpOnly : true,
                }
                  res.cookie("token", token  , options).status(200).json({
                    success: true,
                    token,
                    user,
                    message:"user logged in successfully",
                  });
            }
            else{
                return res.status(403).json({
                    success:false,
                    message:"Invalid password",
                });
            }
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:"Login failure",
            })
        }
    }
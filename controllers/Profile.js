const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req,res) => {
    try{
        //fetch data
        const {gender, dateOfBirth='', about='', contactNumber} = req.body;
        //get user id
        const id = req.user.id;
        //validate
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:'Please fill required fields'
            });
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        //create entry in db using save()
        await profileDetails.save();

        //return
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully'
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Internal server error',
        })
    }
}
//how to schedule deletion
exports.deleteProfile = async (req,res) =>{
    try{
        //fetch user id
        const id = req.user.id;
        if(!id){
            return res.status(400).json({
                success:false,
                message:'User not available'
            });
        }
        //get profile id
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        //delete profile
        await Profile.findByIdAndDelete({_id:profileId});
        //TODO: unenroll user from all enrolled courses
        //delete user what is cron job?
        await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted Successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Internal server error',
        })
    }
}

exports.getAllUserDetails = async (req,res) =>{
    try{
        //get profile id
        const id = req.user.id;
        //validation
        if(!id){
            return res.status(400).json({
                success:false,
                message:'User not available'
            });
        }
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
         //return response
         return res.status(200).json({
            success:true,
            message:"Successfullly Fetched all user details",
            userDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Internal server error',
        })
    }
}
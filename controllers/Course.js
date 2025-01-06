const Course = require("../models/Course");
const Tag = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const Category = require("../models/Category");

//create course handler

exports.createCourse = async (req, res) =>{
    try {
        //fetch course details
        const {courseName, courseDescription, whatYouWillLearn, price, tag, category} = req.body;
        //get thumbnail
        const thumbnail = req.files.thumbnailImage;
        //console.log(courseName, courseDescription, whatYouWillLearn, price, tag);
        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category){
            return res.status(400).json({message: "Please fill all fields"});
        }
        //check instructor
        const userId = req.user.id;
        console.log("Userid :-", userId);
        const instructorDetails = await User.findById(userId); 
        console.log("instructor details: ", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found.',
            })
        }
        //check given tag is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'category Details not found.',
            })
        }
        console.log("category :-",categoryDetails);
        //upload to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        console.log("thumbnail:-", thumbnailImage);

        //create an entry for new course
        
        // const newCourse = await Course.create({
        //     courseName,
        //     courseDescription,
        //     instructor: instructorDetails._id,
        //     whatYouWillLearn : whatYouWillLearn,
        //     price,
        //     category:categoryDetails._id,
        //     tag:tag,
        //     thumbnail:thumbnailImage.secure_url,
        // })

        const newCourse = await Course.create({
			courseName,
			courseDescription,
			instructor: instructorDetails._id,
			whatYouWillLearn: whatYouWillLearn,
			price,
			tag: tag,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
		});
        console.log("newcourse:-", newCourse);
        //add new course to the user schema of instructor
        await User.findByIdAndUpdate(
        {_id: instructorDetails._id},
        {
            $push: {
                courses:newCourse._id,
            }
        },
        {new:true},
    );
    //update the tag ka schema
    //todo:hw
    //return response
    return res.status(200).json({
        success:true,
        message:"course created successfully.",
        data:newCourse,
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Error during course creation.',
        })
    }
}

//getAllCourses handler

exports.showAllCourses = async (req, res) =>{
    try{
        const AllCourses = await Course.find({}, {courseName:true,
                                                    price:true,
                                                    thumbnail:true,
                                                    ratingAndReview:true,
                                                    studentEnrolled:true,}).populate("Instructor").exec();
            return res.status(200).json({
                success:true,
                message:"Data for all courses fetched successfully",
                data:AllCourses,
            })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Cannot fetch course details'
        })
    }
}

exports.getCourseDetails = async (req,res) =>{
    try{
        //get id
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.find({_id:courseId}).populate({
                                                                            path:"instructor",
                                                                            populate:{
                                                                                path:"additionalDetails",
                                                                            },})
                                                                            .populate("category")
                                                                            .populate("ratingAndReview")
                                                                            .populate({
                                                                                path:"courseContent",
                                                                                populate:{
                                                                                    path: "subSection", 
                                                                                },
                                                                            }).exec();
        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`
            })
        }
        //return response
        return res.status(200).json({
            success:true,
            message:`Successfully found the course with ${courseId}`,
            data:courseDetails,
        })
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating
 
exports.createRating = async (req,res) =>{
    try{
        //get user id
        const userId = req.user.id;
        //fetch data 
        const {rating, review, courseId} = req.body;
        //check if user is enrolled
        const courseDetails = await Course.findOne({
                                                    _id:courseId,
                                                    studentEnrolled:{$elemMatch:{$eq:userId},
                                                    }
        });
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"course does not exist",
            })
        }
        //check if user already reviewed
        const alreadyReviewed = await RatingAndReview.findOne({user:userId, course:courseId});
        //if already reviewed
        if(alreadyReviewed){
            return res.status(400).json({
                success:false,
                message:"course is already reviewed by user",
            })
        }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                                            rating, review,
                                                            course:courseId,
                                                            user:userId,
        })
        //update in course
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
                                               {
                                                $push:{
                                                    ratingAndReview:ratingReview._id,
                                                }
                                               },{new:true});
        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"rating and review Successfully",
            ratingReview,
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        })
    }
}

//get average rating
exports.getAverageRating = async (req, res) =>{
    try{
    //get course id
    const courseId = req.body.courseId;
    //calculate average
    const result = await RatingAndReview.aggregate({
        $match: {
            course:new mongoose.Types.ObjectId(courseId),
        },
    },
    {
        $group:{
            _id:null,
            averageRating:{ $avg: "$rating"},
        }
    })
    //return rating
    if(result.lenght > 0){
        return res.status(200).json({
            success:true,
            averageRating: result[0].averageRating,
        })
    }
    return res.status(200).json({
        success:true,
        message:"Average rating is 0, no rating given till now",
        averageRating: 0,
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

//get all rating and reviews
 
exports.getAllRatings = async (req,res) => {
    try{
        const allReviews = await RatingAndReview.find({}).sort({rating:"desc"})
                                                            .populate({
                                                                path:"user",
                                                                select:"firstName lastName email image",
                                                            })
                                                            .populate({
                                                                path:"course",
                                                                select:"courseName",
                                                            }).exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            allReviews,
        })
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:true,
            message:error.message,
        })
    }
}

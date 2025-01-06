const Course = require("../models/Course");
const Section = require("../models/Section");
const {instance} = require("../config/razorpay");
const mailsender = require("../utils/mailSender");
//const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const mailSender = require("../utils/mailSender");

exports.capturePayment = async (req,res) =>{
    //get courseId and userid
    const {course_id} = req.body;
    const userId = req.user.id;
    //validation
    if(!course_id){
        return res.status(400).json({
            success:false,
            message:"courseid not available"
        })
    }
    //valid course details
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.status(400).json({
                success:false,
                message:"course not available"
            });
         }
         //user already pay for the same course
         const uid = new mongoose.Types.ObjectId(userId);
         if(course.studentEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"Student is already enrolled."
            });
         }
        }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount:amount*10,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    };
    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        //return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        })
    }
}

//verify signature of razorpay 

exports.verifySignature = async (req,res) =>{
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("payment is Authorised");
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            //fulfill the action
            //find course and enroll student
            const enrolledCourse = await Course.findByIdAndUpdate({_id:courseId},
                                                                 {$push:{studentEnrolled:userId}},
                                                                {new:true},
                                                                    );
            if(!enrolledCourse){
                return res.status(404).json({
                    success:false,
                    message:"course not found",
                });
            }
            console.log(enrolledCourse);
            //find the student add course in their list 
            const enrolledStudent = await User.findByIdAndUpdate({_id:userId},
                                                                 {$push:{courses:courseId}},
                                                                 {new:true},
            );
            console.log(enrolledStudent);

            //mail send for confirmation
            const emailResponse = await mailSender(
                                                    enrolledStudent.email,
                                                    "Congratulations from Happy",
                                                    "Congratulations, You have successfully bought the course",
            );
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature verified and course added."
            })
        }
        catch(error){
            console.log(error)
            return res.status(500).json({
                success:true,
                message:"error.message"
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'invalid request'
        })
    }
}
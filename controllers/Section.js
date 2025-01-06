const Course = require("../models/Course");
const Section = require("../models/Section");

exports.createSection = async (req,res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;
        //data validate
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'Please enter all fields.',
            })
        }
        //db entry
        const newSection = await Section.create({sectionName});
        //update course with section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                                    courseId,
                                                                    {
                                                                        $push:{
                                                                            courseContent:newSection._id,
                                                                        },
                                                                    },
                                                                    {new:true},
                                                                );
        //HW: use populate to replace sections/subsections both in the updatedCourseDetails.
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created Successfully.",
            updatedCourseDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while section creation.',
        })
    }
} 

exports.updateSection = async (req, res) => {
    try{
        //data input
        const {updateSectionName, sectionId} = req.body;
        //validate
        if(!updateSectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'please fill all fields',
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(
                                                        sectionId,
                                                       {sectionName},
                                                        {new:true},
                                                    );
        //return
        return res.status(200).json({
            success:true,
            message:'Section updated Successfully',
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while section updation.',
        })
    }
}
exports.deleteSection = async (req, res) => {
    try{
        //get id
        const {sectionId} = req.params;
        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        //HW: do we need to delete the entry from the course schema?
        //return
        return res.status(200).json({
            success:true,
            message:'Section Deleted Successfully.',
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while section deletion.',
        })
    }
}
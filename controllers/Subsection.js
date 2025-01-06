const Section = require("../models/Section");
const Subsection = require("../models/Subsection");
const {uploadImageToCloudinary} = require('../utils/imageUploader');

exports.createSubsection = async (req, res) => {
    try{
    //fetch data from req.body
    const {sectionId, title, timeDuration, description} = req.body;
    //extract video
    const video = req.file.videoFile;
    //validation
    if(!title || !timeDuration || !description || !sectionId){
        return res.status(400).json({
            success:false,
            message:'Please fill all fields',
        });
    }
    //upload video to cloudinary get url
    const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
    // create subsection
    const  SubsectionDetails = await Subsection.create({
                    title:title,
                    timeDuration:timeDuration,
                    description:description,
                    videoUrl:uploadDetails.secure_url,
    })
    //update section with this subsection objectid
    const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                            {
                                                                $push:{
                                                                    Subsection:SubsectionDetails._id,
                                                                }
                                                            },
                                                            {new:true},
    );
    //return response
    return res.status(200).json({
        success:true,
        message:"Subsection created successfully",
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error while creating Subsection",
        })
    }
}

//HW: update Subsection
exports.updateSubsection = async (req, res) =>{
    try{
        //fetch data
        const {sectionId, title, timeDuration, description} = req.body;
        //extract video
        const video = req.file.videoFile;
        //validate
        if(!sectionId){
            return res.status(404).json({
                success:false,
                message:"Section id not found",
            });
        }
        
    }
    catch(error){

    }
}
//delete Subsection
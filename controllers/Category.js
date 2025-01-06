const Category = require("../models/Category");
//const Course = require("../models/Course");

//create tag handler

exports.createCategory = async (req, res) => {
    try{
        //fetch data
        const {name, description} = req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required.',
            })
        }
        //create entry in Db
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);
        return res.status(200).json({
            success:true,
            message:'Category created Successfully.',
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Something went wrong while creating tag.',
        })
    }
};

//getAllTags handler function

exports.showAllCategory = async (req, res) =>{
    try{
        const allCategory = await Category.find({}, {name:true, description:true});
        return res.status(200).json({
            success:true,
            message:'All Category returned Successfully.',
            allCategory,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Something went wrong while Showing category.',
        })
    }
}

//categoryPageDetails

exports.categoryPageDetails = async (req, res)=>{
    try{
        //get category id
        const  {categoryId} = req.body;
        console.log(categoryId)
        //get courses for specified categoryid
        const selectedCategory = await Category.findById(categoryId)
                                                        .populate("courses")
                                                        .exec();
        //validation
        if(!selectedCategory) {
            return res.status(400).json({
                success:false,
                message:"Data not found",
            })
        }
        //get courses for diff category
        const differentCategories = await Category.find({
                                                    _id:{$ne:categoryId},
                                                }).populate("courses").exec();
        //get top sellling 
        //const topSellingCategories = await 
        //return response
        return res.status(200).json({
            success:true,
            data:{ selectedCategory, differentCategories}
        })
    }
    catch(error)
    {
        console.log(error); 
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

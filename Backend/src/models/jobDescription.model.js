import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type:String,
        required:true,
        trim:true
    },
    description: {
        type:String,
        trim:true
    },
    requiredSkills:[
        {
            type:String
        }
    ],
    experienceRequired:{
        type:Number,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    qualification: [
        {
            type:String
        }
    ],
    salary:{
        type:Number,
        required:true
    },
    jobType:{
        type:String,
        required:true
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'HR' 
    },
},{timestamps:true});

export const JobDescription = mongoose.model("JobDescription", jobSchema)
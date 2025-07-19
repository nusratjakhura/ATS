import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
    fullName:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        required:true
    },
    phone:{
        type:Number,
        trim:true
    },
    linkedin:{
        type:String,
        trim:true,
    },
    github:{
        type:String,
        trim:true
    },
    skills:[
        {
            type:String
        }
    ],
    uploadedResume:{
        type:String,
        required:true
    },

    qualification:{
        type:String,
        trim:true
    },
    experience:{
        type:Number,
        default:0
    },
    workedAtSameCompany:{
        type: Boolean,
        default: false
    },
    //Applicant applied to ?
    jobApplied:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"JobDescription"
    },
    skillMatch:{
        type:Number,
        required:true,
    },
    testScore:{
        type:Number,
        default:null
    },
    //FOR INTERNAL USAGE & COMMS TO DISPLAY
    status: {
    type: String,
    enum: ['Applied', 'Test_Sent', 'Test_Cleared', 'Interview1_Scheduled', 'Interview1_Cleared', 'Interview2_Scheduled', 'Interview2_Cleared', 'Selected', 'Rejected'],
    default: 'Applied'
    },
    //RECURITMENT STATUS - TO VIEW ONE's HISTORY AFTER THEY've CLEARED / FOR REVIEW OF ONE's PERFORMANCE.
    aptitute_test:{
        type:String,
        enum:['NA','Cleared', 'Not_Cleared', 'Performing_Test'],
        default:'NA'
    },
    interview_1:{
        type:String,
        enum:['NA','Cleared', 'Not_Cleared', 'Undergoing'],
        default:'NA'
    },
    interview_1_Comments:{
        type:String,
        default: "None"
    },
    interview_2:{
        type:String,
        enum:['NA','Cleared', 'Not_Cleared', 'Undergoing'],
        default:'NA'
    },
    interview_2_Comments:{
        type:String,
        default: "None"
    },
    onboardingMessage:{
        type:String,
        default: null
    },
    onboardedAt:{
        type:Date,
        default: null
    },
},{timestamps:true});

export const Applicant = mongoose.model("Applicant", applicantSchema)
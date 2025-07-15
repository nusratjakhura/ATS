import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
    
},{timestamps:true});

export const Applicant = mongoose.model("Applicant", applicantSchema)
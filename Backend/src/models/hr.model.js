import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const hrSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:true
    },
    password:{
        type:String,
        trim:true,
        required:true
    },
    companyName:{
        type:String,
        required:true,
        trim:true
    }

},{timestamps:true})

export const User = mongoose.model("HR",hrSchema);
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({},{timestamps:true})

export const User = mongoose.model("User",userSchema);
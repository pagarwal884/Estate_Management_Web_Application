import mongoose from "mongoose";
import { resetPasswordStyles } from "../../Frontend/src/assets/dummyStyles";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer"
    },
    phone: {
        type: String
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    profilepic: {
        type: String,
    },
    address: {
        type: String
    },
    IsApproved: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    timestamps: true
})

const User = mongoose.model("User", userSchema)

export default User
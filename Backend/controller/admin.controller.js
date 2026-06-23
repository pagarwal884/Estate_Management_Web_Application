import User from "../models/usermodels.js";
import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password")
        res.json({
            success: true,
            count: users.length,
            users
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        user.isBlocked = !user.isBlocked
        await user.save()

        res.json({
            success: true,
            message: user.isBlocked ? "User Blocked" : "User Unblocked",
            isBlocked: user.isBlocked

        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.json({
            success: true,
            message: "User deleted Successfully"
        })

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate("seller", "name email")
        res.json({
            success: true,
            count: properties.length,
            properties
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const deleteProperty = async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id)

        res.json({
            success: true,
            message: "Properety Deleted Successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const getAllInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.find().populate("buyer", "name email")
            .populate("seller", "name email")
            .populate("property", "title price")
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            count: inquiry.length,
            inquiry
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const totalProperties = await Property.countDocuments()
        const activeListing = await Property.countDocuments({
            status: "sale"
        })
        const soldProperties = await Property.countDocuments({
            status: "sold"
        })
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProperties,
                activeListing,
                soldProperties
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getPendingSeller = async (req, res) => {
    try {
        const pendingSellers = await User.find({
            role: "seller",
            isApproved : false
        }).select("-password")

        res.json({
            success: true,
            count: pendingSellers.length,
            pendingSellers
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const approveSeller = async (req, res) => {
    try {
        const seller = await User.findById(req.params.id)

        if(!seller || seller.role !== "seller"){
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            })
        }

        seller.isApproved = true
        await seller.save()

        res.json({
            success: true,
            message: "Seller is approved successfully",
            seller
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}
import User from "../models/usermodels.js"
import { UploadToCloudinary } from "../utils/uploadTocloudinary.js"

// Get Profile
export const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .select("-password")

        res.status(200).json({
            success: true,
            user
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


// Get Public Profile
export const getPublicprofile = async (req, res) => {

    try {

        const user = await User.findById(req.params.id)
            .select("name profilePic role createdAt")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            user
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


// Update Profile
export const updateProfile = async (req, res) => {

    try {

        const { name, phone, address, removeProfilePic } = req.body

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Upload image
        if (req.file) {

            const result = await UploadToCloudinary(
                req.file.buffer,
                "profiles"
            )

            // Save image URL
            user.profilePic = result.secure_url
        }else if (removeProfilePic === "true") {
            user.profilePic = ""
        }

        // Update fields
        if (name) user.name = name
        if (phone) user.phone = phone
        if (address) user.address = address
        
        await user.save()

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        })

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}
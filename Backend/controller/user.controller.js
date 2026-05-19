import User from "../models/usermodels.js"

// get profile
export const getProfile = async(req, res)=> {
    try {
        const user = await User.findById(req.user._id).select("-password")
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


// get Public ID

export const getPublicprofile = async(req, res) => {
    try {
        const user = await User.findById(req.params.id).select("name profilePic role createdAt")

        if(!user) {
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

// Update a Profile
export const updateProdile = async (req, res) => {
    try {
        const {name, phone, address, removeProfilePic} = req.body
        const user = await User.findById(req.user._id)

        if(!user){
            return res.status(404),json({
                success: false,
                message: "User not found"
            })
        }

        // image handing
    } catch (err) {
        
    }
}
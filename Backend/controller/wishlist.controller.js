import { populate } from "dotenv";
import Wishlist from "../models/wishlist.model.js";

// to add property to the wishlist
export const addwishlist = async (req, res) => {
    try {
        const propertyId = req.params.propertyId
        const existing = await Wishlist.findOne({
            user: req.user._id,
            property: propertyId,
        })

        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Already in wishlist"
            })
        }
        await Wishlist.create({
            user: req.user._id,
            property: propertyId,
        })

        res.status(201).json({
            success: true,
            message: "Added to wishlist"
        })
    } catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}

// to get the property that is in wishlist
export const getWishlist = async (req, res) => {
    try {
        const data = await Wishlist.find({
            user: "req.user._id"
        }).populate("property")

        res.status(200).json(data)
    } catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}

// to remove a property from your wishlist

export const removewishlist = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const result = await Wishlist.findOneAndDelete({
            user: req.user._id,
            property: propertyId,
        })

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Wsishlist item not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Removed from your wishlist"
        })
    } catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}
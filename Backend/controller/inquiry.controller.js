import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.model.js";

// buyer send inquiry
export const sendInquiry = async(req, res) => {
    try {
        const {propertyId, message} = req.body
        const property = await Property.findById(propertyId).populate("seller")

        if(!property){
            res.status(404).json({
                success: false,
                message: "Property not found!"
            })
        }

        const enquiry = await Inquiry.create({
            property: property._id,
            buyer:  req.user._id,
            seller: property.seller._id,
            message
        })
        req.status(201).json({
            success: true,
            message: "Inquiry send successfully",
            enquiry
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

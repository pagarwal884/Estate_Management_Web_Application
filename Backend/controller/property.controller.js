import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import { UploadToCloudinary } from "../utils/uploadTocloudinary.js";


// Add a property
export const addproperty = async (req, res) => {
    try {
        let imageUrls = []
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const result = await UploadToCloudinary(file.buffer)
            }
        }

        const property = await Property.create({
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            city: req.body.city,
            area: req.body.area,
            pincode: req.body.pincode,
            propertyType: req.body.propertyType,
            bhk: req.body.bhk ? String(req.body.bhk) : undefined,
            bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
            areaSize: req.body.areaSize ? Number(req.body.areaSize) : undefined,
            furnishing: req.body.furnishing,
            status: req.body.status,
            images: imageUrls,
            seller: req.user._id,
            amenities: req.body.amenities
                ? Array.isArray(req.body.amenities)
                    ? req.body.amenities
                    : (() => {
                        try {
                            return JSON.parse(req.body.amenities);
                        } catch (e) {
                            return req.body.amenities.split(",");
                        }
                    })()
                : [],
        });
    }
    catch (error) {
        console.error("ADD_PROPERTY_ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error while adding property",

        });
    }
} 
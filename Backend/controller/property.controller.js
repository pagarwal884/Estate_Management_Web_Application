import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import { UploadToCloudinary } from "../utils/uploadTocloudinary.js";
import cloudinary from "../config/cloudinary.js";


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

        res.json({
            success: true,
            property
        })
    }
    catch (error) {
        console.error("ADD_PROPERTY_ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error while adding property",

        });
    }
}

// to get my property
export const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            seller: req.user._id
        })
        res.json({
            success: true,
            properties
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// UPDATE PROPERTY
export const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        if (property.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        const fields = [
            "title",
            "description",
            "price",
            "city",
            "area",
            "pincode",
            "propertyType",
            "bhk",
            "bathrooms",
            "areaSize",
            "furnishing",
            "status",
            "amenities",
        ];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                if (field === "amenities" && typeof req.body[field] === "string") {
                    try {
                        property[field] = JSON.parse(req.body[field]);
                    } catch (e) {
                        property[field] = req.body[field].split(",");
                    }
                } else {
                    property[field] = req.body[field];
                }
            }
        });

        if (req.body.existingImages) {
            try {
                const existing = JSON.parse(req.body.existingImages);
                property.images = Array.isArray(existing) ? existing : property.images;
            } catch (e) {
                console.error("Failed to parse existingImages:", e);
            }
        }

        if (req.files && req.files.length > 0) {
            let newImages = [];
            for (let file of req.files) {
                const result = await uploadToCloudinary(file.buffer, "properties");
                newImages.push(result.secure_url);
            }
            property.images = [...property.images, ...newImages];
        }

        await property.save();

        res.json({
            success: true,
            message: "Property updated",
            property,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// to delete a property
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found!"
            })
        }

        if (property.seller.toString !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not Autherized"
            })
        }

        // delete image from cloudinary
        for (let imageUrl of property.images) {
            const publicId = imageUrl.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy
                ("properties/" + publicId)
        } await property.save();

        res.json({
            success: true,
            message: "Property updated",
            property,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update property status
export const updatePropertyStatus = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found!"
            })
        }

        if (property.seller.toString !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not Autherized"
            })
        }

        property.status = req.body.status;
        await property.save()

        res.json({
            status: true,
            message: "Property status updated Successfully",
            property
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// To get all the properties

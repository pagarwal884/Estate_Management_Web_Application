import express from "express"
import { addproperty, deleteProperty, getAllProperties, getMyProperties, getPropertyCount, getPropertyDetails, getSellerDashboard, updateProperty, updatePropertyStatus } from "../controller/property.controller.js";
import {authorize, protect} from "../middlewares/auth.middleware.js"
import Upload from "../middlewares/upload.middleware.js"


const propertyRouter = express.Router();

propertyRouter.get("/", getAllProperties)

// protect the routes that only seller can do these works
propertyRouter.post("/", protect, authorize("seller"), Upload.array("images", 10), addproperty )
propertyRouter.get("/my", protect, authorize("seller"), getMyProperties)
propertyRouter.put("/:id", protect, authorize("seller"), Upload.array("images", 10), updateProperty)

propertyRouter.delete("/:id", protect, authorize("seller"), Upload.array("images", 10), deleteProperty)

propertyRouter.patch("/:id/status", protect, authorize("seller"), updatePropertyStatus )

propertyRouter.get("/counts", getPropertyCount)
propertyRouter.get("/:id",getPropertyDetails)

propertyRouter.get("/seller/dashboard", protect, authorize("seller"), getSellerDashboard)

export default propertyRouter
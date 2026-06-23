import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import { approveSeller, blockUser, deleteProperty, deleteUser, getAllInquiry, getAllProperties, getAllUsers, getDashboardStats, getPendingSeller } from "../controller/admin.controller.js";

const adminRouter = express.Router()

adminRouter.use(protect, authorize("admin"))

adminRouter.get("/users", getAllUsers)
adminRouter.patch("/users/:id/block", blockUser)

adminRouter.delete("/users/:id", deleteUser)
adminRouter.get("/properties", getAllProperties)

adminRouter.delete("/properties/:id", deleteProperty)
adminRouter.get("/inquiries", getAllInquiry)

adminRouter.get("/stats", getDashboardStats)

adminRouter.get("/pending-seller", getPendingSeller)
adminRouter.patch("/approved-seller/:id", approveSeller)

export default adminRouter
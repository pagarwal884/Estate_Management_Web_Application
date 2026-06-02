import express from 'express'
import { protect } from "../middlewares/auth.middleware.js"
import { getProfile, getPublicprofile } from '../controller/user.controller.js'
import Upload from '../middlewares/upload.middleware.js'

const userRouter = express.Router()

userRouter.get("/profile", protect, getProfile)

userRouter.put("/profile", protect, Upload.single("profilePic"))

userRouter.get("/public/:id", getPublicprofile)

export default userRouter
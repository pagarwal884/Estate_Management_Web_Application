import express from "express"
import {protect} from "../middlewares/auth.middleware.js"
import {addWishlist, getWishlist, removewishlist} from "../controller/wishlist.controller.js"

const wishlistRouter = express.Router()

wishlistRouter.post("/:propertyId", protect, addWishlist)
wishlistRouter.get("/", protect, getWishlist)

wishlistRouter.delete("/:propertId", protect, removewishlist)

export default wishlistRouter
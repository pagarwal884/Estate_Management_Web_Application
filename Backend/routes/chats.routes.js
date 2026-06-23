import express from "express";
import Chat from "../models/chat.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.use(protect);

chatRouter.post("/start", async (req, res) => {
    try {
        const {
            propertyId,
            sellerId,
            buyerId: providedBuyerId
        } = req.body;

        let buyerId;
        let finalSellerId;

        if (req.user.role === "seller") {
            buyerId = providedBuyerId;
            finalSellerId = req.user._id;
        } else {
            buyerId = req.user._id;
            finalSellerId = sellerId;
        }

        if (!buyerId || !finalSellerId) {
            return res.status(400).json({
                success: false,
                message: "Missing buyer or seller ID"
            });
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            buyer: buyerId,
            seller: finalSellerId,
            property: propertyId
        });

        if (!chat) {
            chat = await Chat.create({
                property: propertyId,
                buyer: buyerId,
                seller: finalSellerId,
                messages: []
            });
        }

        chat = await Chat.findById(chat._id)
            .populate("buyer", "name email profilePic")
            .populate("seller", "name email profilePic")
            .populate("property", "title price images");

        res.status(200).json({
            success: true,
            chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


export default chatRouter;
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

// to send message
chatRouter.post("/send", async(req, res) => {
    try {
        const{chatId, text, image} = req.body
        const userId = req.user.id
        
        const chat = await Chat.findById(chatId)
        if(!chat) return res.status(404).json({
            message: "Chat not found"
        })

        if(chat.buyer.toString() !== userId && chat.seller.toString() !== userId){
            return res.status(403).json({
                message: "You are not a participant of this chat"
            })
        }

        const newMessage = {
            sender: userId,
            text,
            image,
            timestamp: new Date()
        }
        chat.messages.push(newMessage)
        await chat.save()
        const savedMessage = chat.messages[chat.messages.length - 1]
        res.json({chat, newMessage: savedMessage})
    } catch (error) {
        res.status(500).json({
            message: error.message
        })  
    }
})

// to get chat for user
chatRouter.get("/user", async(req, res) => {
    try {
        const userId = req.user.id
        const chats = await Chat.find({
            $or: [
                { buyer: userId },
                { seller: userId }
            ]
        })
        .populate("buyer", "name email profilePic")
        .populate("seller", "name email profilePic")
        .populate("property", "title price images")
        .sort({ updatedAt: -1 })

        res.json({chats})
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

export default chatRouter;
import express from "express";
import Chat from "../models/chat.models.js";
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

// to get chat messages
chatRouter.get("/:chatId", async(req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId).populate("messages.sender", "name email profilePic")

        if(!chat) return res.status(404).json({
            message: "Chat not found"
        })

        const userId = req.user.id
        if(chat.buyer.toString() !== userId && chat.seller.toString() !== userId){
            return res.status(403).json({
                message: "You are not a participant of this chat"
            })
        }
        res.json({chat})
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

// to delete an entire chat
chatRouter.delete("/:chatId", async(req, res) => {
    try {
        const userId = req.user._id
        const chat = await Chat.findById(req.params.chatId)
        if(!chat) return res.status(404).json({
            message: "Chat not found"
        })
        if(chat.buyer.toString() !== userId.toString() && chat.seller.toString() !== userId.toString()){
            return res.status(403).json({
                message: "You are not a participant of this chat"
            })
        }
        await Chat.findByIdAndDelete(req.params.chatId)
        res.json({message: "Chat deleted successfully"})
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }               
})

// to delete a specific message from a chat
chatRouter.delete("/:chatId/message/:messageId", async(req, res) => {
    try {
        const userId = req.user._id 
        const chat = await Chat.findById(req.params.chatId)
        if(!chat) return res.status(404).json({
            message: "Chat not found"
        })

        const message = chat.messages.id(req.params.messageId)
        if(!message) return res.status(404).json({
            message: "Message not found"
        })

        if(message.sender.toString() !== userId.toString()){
            return res.status(403).json({
                message: "You can only delete your own messages"
            })
        }
        chat.messages.remove(req.params.messageId)  
        await chat.save()
        res.json({message: "Message deleted successfully"})
    }   
    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

export default chatRouter;
import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import { connect } from 'http2';
import { connectdb } from './config/db.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
import inquiryRouter from './routes/inquiry.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import adminRouter from './routes/admin.routes.js';
import chatRouter from './routes/chats.routes.js';

const app = express()
const PORT = 5000

// DB
connectdb()

// Middleware
const allowedOrigins = ['http://localhost:5173/'].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json())

// Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/property", propertyRouter)
app.use("/api/inquiry", inquiryRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/admin", adminRouter)
app.use("/api/chat", chatRouter)

app.get("/", (req, res) => {
    res.send("API WORKING")
})

const server = http.createServer(app)
// server setup

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        Methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {
    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
    });
    socket.on("sendMessage", (data) => {
        io.to(data.chatId).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`)
})
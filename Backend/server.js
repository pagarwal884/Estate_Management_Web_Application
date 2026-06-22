import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import http from 'http'
import { connect } from 'http2';
import { connectdb } from './config/db.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
import inquiryRouter from './routes/inquiry.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';

const app = express()
const PORT = 5000

// DB
connectdb()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/property", propertyRouter)
app.use("/api/inquiry", inquiryRouter)
app.use("/api/wishlist", wishlistRouter)

app.get("/", (req,res)=>{
    res.send("API WORKING")
})

const server = http.createServer(app)

server.listen(PORT, ()=>{
    console.log(`server started on http://localhost:${PORT}`)
})
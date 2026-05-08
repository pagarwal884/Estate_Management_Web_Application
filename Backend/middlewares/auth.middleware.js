import jwt from "jsonwebtoken";
import User from "../models/usermodels.js";

// protect
export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            return res.status(401).json({
                message: "Not Authorized, token missing",
                success: false``
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decoded.id).select("-password")

        if(req.user && req.user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked by an admin",
                success: false
            })
        }
        next()

    } catch (err) {
        res.status(401).json({.
            success: false,
            message: "Token Inavlid"
        })
    }
};

// role based auth
export const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message:"Access Denied. You don't have permission to access"
            })
        }
        next()
    }
}
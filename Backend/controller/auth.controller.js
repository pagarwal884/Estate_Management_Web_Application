import User from "../models/usermodels.js";
import sendEmail from "../utils/sendEmails.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

// Register
export const Register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            IsApproved: role === "seller" ? false : true,
            verificationToken
        });

        try {
            await sendEmail({
                email,
                subject: "Verify Your Email - Real Estate Platform",
                message: `<p>Your email verification code is: <strong>${verificationToken}</strong></p>
                          <p>Please enter this code on the verification page to activate your account</p>`
            });
        } catch (error) {
            console.error("Failed to send verification Email", error);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Verification email sent.",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.IsApproved
            }
        });

    }
    catch (error) {
        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error during registration",
            error: error.message
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password both are required"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or Password"
            })
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked by an admin, Please contact support."
            })
        }

        const token = jwt.sign({ id: user._id, role: user.role, }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.json({
            message: "Login Successful",
            user,
            token
        })
    } catch (error) {
        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error during registration",
            error: error.message
        });
    }
}
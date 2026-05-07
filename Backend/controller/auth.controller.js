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
            isApproved: role === "seller" ? false : true,
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
                isApproved: user.isApproved
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

// To get profile
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({
                message: "User not Found"
            })
        }
        res.json({
            success: true,
            user
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

// Verify the email  

export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body
        if (!email || !code) {
            return res.status(400).json({
                message: "Email and Code is required"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid Email"
            })
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            })
        }

        if (user.verificationToken !== code) {
            return res.status(400).json({
                message: "Invalid Verification code"
            })
        }

        user.isVerified = true
        user.verificationToken = undefined
        await user.save()
        return res.status(200).json({
            message: "Email Verified successfully",
            success: true
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

// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No user found with that email address" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        const clientUrl = "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
        const message = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Please click on the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset - Real Estate Platform",
                message,
            });
            res.status(200).json({ message: "Password reset email sent", success: true });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Could not send email", success: false });
        }
    } catch (err) {
        res.status(500).json({ message: err.message, success: false });
    }
};
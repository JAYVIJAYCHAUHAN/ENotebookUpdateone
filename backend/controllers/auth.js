if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ExpressError = require('../utils/ExpressError');
const sendEmail = require('../utils/sendEmail');

    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
    const ACCESS_TOKEN_EXPIRY = "15m"; // Short-lived access token
    const REFRESH_TOKEN_EXPIRY = "7d"; // Long-lived refresh token

// Function to generate access & refresh tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

module.exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    const savedUser = await user.save();

    const tokens = generateTokens(user);

    res.status(201).json({ success: true, user: savedUser, ...tokens });
};

module.exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    
    if (!foundUser) {
        throw new ExpressError("Invalid credentials", 400);
    }

    const tokens = generateTokens(foundUser);
    
    res.status(200).json({ success: true, ...tokens });
};

// Middleware to fetch user
module.exports.fetchUser = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ error: "Access denied, token missing" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ error: "Token expired. Please refresh your token." });
        }
        return res.status(400).json({ error: "Invalid token" });
    }
};

module.exports.getUser = async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    res.status(200).json(user);
};

// Refresh Token Endpoint
module.exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ error: "Invalid refresh token" });
    }
};

require('dotenv').config()

const jwt = require('jsonwebtoken');
const {userSchema, userSchemaLogin, newNoteSchema} = require('./joiSchema')
const ExpressError = require('./utils/ExpressError')

module.exports.validateUserRegister = (req, res, next) => {
    const { error } = userSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.validateUserLogin = (req, res, next) => {
    const { error } = userSchemaLogin.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.fetchUser = (req, res, next) => {
    // Get user from jwt token and add id to req object
    const token = req.header('auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({message: "Please authenticate with a valid Token"})  //401 access denied
    }
    
    try {
        // Use environment variable for JWT_SECRET
        const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
        const data = jwt.verify(token, JWT_SECRET);
        // Handle both formats - support legacy format (data.user) and new format with userId
        req.user = data.user || data;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.name, error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ error: "Token expired. Please refresh your token." });
        }
        return res.status(400).json({ error: `Invalid token: ${error.message}` });
    }
}

module.exports.validateNewNote = (req,res, next) => {
    const { error } = newNoteSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        console.log(msg);
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// Validate that required fields for sub-notes are present
module.exports.validateSubNote = (req, res, next) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ 
            success: false, 
            message: "Sub-note title and content are required fields" 
        });
    }
    
    if (typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).json({ 
            success: false, 
            message: "Sub-note title must be at least 3 characters long" 
        });
    }
    
    if (typeof content !== 'string' || content.trim().length < 3) {
        return res.status(400).json({ 
            success: false, 
            message: "Sub-note content must be at least 3 characters long" 
        });
    }
    
    next();
}

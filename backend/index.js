require('dotenv').config(); // Load environment variables

const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors')

const authRoute = require('./routes/auth')
const notesRoute = require('./routes/notes')

// express init
const app = express()

// mongoose init
const dbUrl = process.env.DB_URL
async function main() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}
main();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204
}))

// middleware
app.use(express.json())

// Routes
app.get('/', (req, res) => {
    res.json({ message: "API is running" })
})

app.use('/api/auth', authRoute)
app.use('/api/notes', notesRoute)

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log error for debugging
    console.error(err);

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: process.env.NODE_ENV === 'development' ? message : 'An error occurred',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
})

const port = process.env.PORT || 9000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

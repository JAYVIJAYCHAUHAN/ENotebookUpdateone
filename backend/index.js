 require('dotenv').config(); // Load environment variables

const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors')

const authRoute = require('./routes/auth')
const notesRoute = require('./routes/notes')

// express init
const app = express()

// mongoose init
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/inotebook'
async function main() {
  await mongoose.connect(dbUrl);
  console.log("Database connected");
}
main().catch(err => console.log(err));
app.use(
  "/about/api/auth/createuser",
  cors({
    origin: "https://e-notebook-updateone.vercel.app",
    methods: "POST",
    credentials: true,
  })
);
app.use(
  cors({
    
    origin: "https://e-notebook-updateone.vercel.app/about",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// middleware
app.use(express.json())


// Routes
app.get('/', (req, res) => {
    res.send("Hello world")
})

app.use('/api/auth', authRoute)
app.use('/api/notes', notesRoute)


// error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went wrong'
    res.status(statusCode).json({success: false, message: err.message}); //For development
})

const port = process.env.PORT||9000
app.listen(port, (req, res) => {
    console.log(`Listening to the port ${port}`);

})

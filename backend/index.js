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
  origin: '*', // Allow any origin for now, can be restricted later to specific frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204
}))

// middleware
app.use(express.json())

// Add request logging middleware before route handlers
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log(`Request Body:`, req.body);
    console.log(`Request Headers:`, req.headers);
    
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: "API is running",
        version: "1.1.0", // Add version for tracking deployed code
        serverTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        routes: {
            auth: "/api/auth",
            notes: "/api/notes"
        }
    })
})

// Add a health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        apiRoutes: {
            auth: {
                login: "/api/auth/login",
                signup: "/api/auth/signup",
                getuser: "/api/auth/getuser"
            },
            notes: {
                all: "/api/notes",
                byId: "/api/notes/:id",
                subNotes: "/api/notes/:noteId/subnotes",
                subNoteById: "/api/notes/:noteId/subnotes/:subNoteId"
            }
        }
    });
});

app.use('/api/auth', authRoute)
app.use('/api/notes', notesRoute)

// Log all registered routes for debugging
console.log('\n--- ALL REGISTERED ROUTES ---');
function getRoutes(stack, path = '') {
    const routes = [];
    stack.forEach(middleware => {
        if (middleware.route) {
            // This is a route middleware
            const methods = Object.keys(middleware.route.methods)
                .filter(method => middleware.route.methods[method])
                .map(method => method.toUpperCase());
            
            routes.push(`${methods.join(',')}\t${path}${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            // This is an Express router
            const routerPath = path + (middleware.regexp.toString().indexOf('^\\/') === 1
                ? middleware.regexp.toString().substring(3, middleware.regexp.toString().lastIndexOf('\\/?'))
                : '');
            
            getRoutes(middleware.handle.stack, routerPath).forEach(route => {
                routes.push(route);
            });
        }
    });
    return routes;
}

const routes = getRoutes(app._router.stack);
routes.forEach(route => console.log(route));
console.log('-------------------------\n');

// 404 handler
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    console.log('Available routes:');
    console.log(' - /api/auth/*');
    console.log(' - /api/notes/*');
    console.log('Headers:', req.headers);
    
    res.status(404).json({ 
        success: false, 
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
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

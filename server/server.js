const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Assuming you have a DB connection setup in config/db.js
const cookieParser = require("cookie-parser");
const { protect } = require("./middlewares/protect.js"); // Protect middleware for authenticated routes
const projectRoutes = require("./routes/project"); // Project routes
const taskRoutes = require("./routes/task"); // Task routes
const authRoutes = require("./routes/auth"); // User routes (login, register, etc.)
const cors = require("cors"); // For handling CORS (Cross-Origin Resource Sharing)

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(cookieParser()); // To handle cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Client URL (Frontend URL) for CORS configuration
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Routes
app.use("/api/auth", authRoutes); // User-related routes (login, register, etc.)
app.use("/api/projects", protect, projectRoutes); // Project routes, protected
app.use("/api/tasks", protect, taskRoutes); // Task routes, protected

// Error handling middleware (for async errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

// Default route (for testing)
app.get("/", (req, res) => {
  res.send("Welcome to the Project Management API!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

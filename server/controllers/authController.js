const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../lib/helper.js");

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    return res.json({ success: false, message: "User already exists" });
  }

  // Create a new user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // Generate JWT token
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true, // Secure cookie, can't be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Ensures cookie is sent over HTTPS in production
      maxAge: 3600000, // 1 hour
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } else {
    res.status(400);
    return res.json({ success: false, message: "Invalid user data" });
  }
});

// Authenticate a user (login)
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    return res.json({ success: false, message: "Invalid credentials" });
  }

  // Check if the password matches
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    res.status(401);
    return res.json({ success: false, message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Set token as a cookie
  res.cookie("token", token, {
    httpOnly: true, // Secure cookie, can't be accessed via JavaScript
    secure: process.env.NODE_ENV === "production", // Ensures cookie is sent over HTTPS in production
    maxAge: 3600000, // 1 hour
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// Logout a user
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token"); // Clear the cookie containing the JWT token
  return res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
});

// Get current user (protected route)
const getCurrentUser = asyncHandler(async (req, res) => {
  console.log("getCurrentUser", req.user.id);

  const user = await User.findById(req.user.id); // req.user.id is set by the authorization middleware
  if (!user) {
    res.status(404);
    return res.json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};

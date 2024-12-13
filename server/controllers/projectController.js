const Project = require("../models/Project");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Ensure the creator exists
  const creator = await User.findById(req.user.id);
  if (!creator) {
    return res
      .status(404)
      .json({ success: false, message: "Creator not found" });
  }

  // Create the project without participants
  const project = await Project.create({
    name,
    description,
    creator: req.user.id,
  });

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    project,
  });
});

// Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({});

  return res.status(200).json({
    success: true,
    projects,
  });
});

// Get a single project by ID
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("creator", "name email") // Populate creator details
    .populate("participants", "name email") // Populate participant details
    .populate("tasks"); // Populate tasks

  if (!project) {
    res.status(404);
    return res.json({ success: false, message: "Project not found" });
  }

  return res.status(200).json({
    success: true,
    project,
  });
});

// Update project details
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  }

  // Only the creator can update the project
  if (project.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this project",
    });
  }

  project.name = name || project.name;
  project.description = description || project.description;

  await project.save();

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project,
  });
});

// Delete a project
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    return res.json({ success: false, message: "Project not found" });
  }

  // Only the creator can delete the project
  if (project.creator.toString() !== req.user.id) {
    res.status(403);
    return res.json({
      success: false,
      message: "You are not authorized to delete this project",
    });
  }

  await project.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});

const addParticipant = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { userId } = req.body; // Expecting a single userId, not an array
  console.log("Received projectId:", projectId);
  console.log("Received userId:", userId);

  // Find the project
  const project = await Project.findById(projectId);
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  }

  // Check if the requester is the project creator
  if (project.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to add participants to this project",
    });
  }

  // Find the user to be added
  const user = await User.findById(userId);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: `User with ID ${userId} not found` });
  }

  // Add the user to the project participants if not already added
  if (!project.participants.includes(userId)) {
    project.participants.push(userId);
    await project.save();
  }

  // Add the project to the user's joinedProjects if not already added
  if (!user.joinedProjects.includes(projectId)) {
    user.joinedProjects.push(projectId);
    await user.save();
  }

  return res.status(200).json({
    success: true,
    message: "Participant added successfully",
    project,
  });
});

// Remove multiple participants from a project
const removeParticipant = asyncHandler(async (req, res) => {
  const projectId = req.params.id; // Project ID comes from URL
  const { userId } = req.body; // Expecting a single user ID

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing userId. Must provide a single user ID.",
    });
  }

  // Find the project by ID
  const project = await Project.findById(projectId);
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  }

  // Check if the requester is the project creator
  if (project.creator.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to remove participants from this project",
    });
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: `User with ID ${userId} not found` });
  }

  // Remove the user from the project participants
  project.participants = project.participants.filter(
    (id) => id.toString() !== userId.toString()
  );

  // Remove the project from the user's joinedProjects
  user.joinedProjects = user.joinedProjects.filter(
    (id) => id.toString() !== projectId.toString()
  );

  // Save the changes for the user and project
  await project.save();
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Participant removed successfully",
    project,
  });
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addParticipant,
  removeParticipant,
};

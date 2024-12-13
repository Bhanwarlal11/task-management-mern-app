const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const { projectId, title, description, assignedTo, dueDate, status } = req.body;

  // Ensure project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  // Ensure the assigned user exists
  const user = await User.findById(assignedTo);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Assigned user not found' });
  }

  // Check if the assigned user is part of the project participants
  if (!project.participants.includes(assignedTo)) {
    return res.status(400).json({
      success: false,
      message: 'Assigned user is not a participant of the project',
    });
  }

  // Check if the user is already assigned a task in this project (optional validation)
  const existingTask = await Task.findOne({ projectId, assignedTo, isCompleted: false });
  if (existingTask) {
    return res.status(400).json({
      success: false,
      message: 'The user is already assigned a pending task in this project.',
    });
  }

  // Create the task
  const task = await Task.create({
    projectId,
    title,
    description,
    assignedTo,
    dueDate,
    status,
  });

  // Add the task to the project's tasks array
  project.tasks.push(task._id);
  await project.save();

  // Optionally: Send notification or perform another action (for now, it's a placeholder)
  // Example: sendEmailNotification(user.email, task); // Assuming you have an email notification setup

  return res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task,
  });
});



// Get all tasks for a project
const getTasksForProject = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.projectId });

  if (!tasks) {
    res.status(404);
    return res.json({ success: false, message: 'No tasks found for this project' });
  }

  return res.status(200).json({
    success: true,
    tasks,
  });
});

// Get a single task by ID
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name description');

  if (!task) {
    res.status(404);
    return res.json({ success: false, message: 'Task not found' });
  }

  return res.status(200).json({
    success: true,
    task,
  });
});

// Update task details
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, dueDate, status, isCompleted } = req.body;

  // Find the task by ID
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  // Find the project associated with the task
  const project = await Project.findById(task.projectId); // Assuming `task.projectId` stores the project ID

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  // Check if the user is the project creator or the assigned user
  if (project.creator.toString() === req.user.id) {
    // If the user is the project creator, allow all fields to be updated
    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate || task.dueDate;
    task.status = status || task.status;
    task.isCompleted = isCompleted || task.isCompleted;
  } else if (task.assignedTo.toString() === req.user.id) {
    // If the user is the assigned user, allow only `status` and `isCompleted` to be updated
    task.status = status || task.status;
    task.isCompleted = isCompleted || task.isCompleted;
  } else {
    // If the user is neither the creator nor the assigned user, deny access
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this task',
    });
  }

  // Save the updated task
  await task.save();

  return res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    task,
  });
});



// Delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  // Ensure the user is the creator of the project
  const project = await Project.findById(task.projectId);  // Assuming task has a projectId field
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (project.creator.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You are not authorized to delete this task' });
  }

  // Delete the task
  await Task.deleteOne({ _id: task._id });

  return res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});



module.exports = {
  createTask,
  getTasksForProject,
  getTaskById,
  updateTask,
  deleteTask,
};

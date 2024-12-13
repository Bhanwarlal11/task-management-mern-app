const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksForProject,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.post("/", createTask);

// Route to get all tasks for a specific project
router.get("/:projectId", getTasksForProject);

// Route to get a single task by ID
router.get("/task/:id", getTaskById);

// Route to update task details
router.put("/task/:id", updateTask);

// Route to delete a task
router.delete("/task/:id", deleteTask);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addParticipant,
  removeParticipant
} = require("../controllers/projectController");

// Route to create a new project
router.post("/", createProject);

// Route to get all projects
router.get("/", getAllProjects);

// Route to get a single project by ID
router.get("/:id", getProjectById);

// Route to update project details
router.put("/:id", updateProject);

// Route to delete a project
router.delete("/:id", deleteProject);

// Route to add a participant to the project
router.put('/:id/add-participant', addParticipant);

// Route to remove a participant from the project
router.put('/:id/remove-participant', removeParticipant);


module.exports = router;

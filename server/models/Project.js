const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References to the User model
    required: false
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // References to the Task model
    required: false
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;

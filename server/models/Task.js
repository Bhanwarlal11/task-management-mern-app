const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Reference to the Project model
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed', 'Blocked'],
    default: 'To Do'
  },
  isCompleted: {
    type: Boolean,
    default: false,
    required: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true 
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // avatar: {
  //   type: String,
  //   required: false // Avatar is optional
  // },
  joinedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // References to the Project model
    required: false
  }],
  createdProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // References to the Project model
    required: false
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Hash password before saving to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

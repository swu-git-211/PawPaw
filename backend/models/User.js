//models User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },   
  birthday: { type: Date, default: null }, 
  bio: { type: String, default: 'Write something about yourself or your pets' },
  petTypes: { type: [String], enum: ['Cat', 'Dog', 'Bird', 'Fish', 'Rabbit', 'Turtle', 'Other'], default: [] },
  profileImage: { type: String, default: '' },
  showEmail: { type: Boolean, default: false },
});
  
module.exports = mongoose.model('User', UserSchema);
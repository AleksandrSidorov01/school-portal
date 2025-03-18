const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  grades: [{ subject: String, grade: String }],
  comments: [String],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Кто добавил ученика
});

module.exports = mongoose.model('Student', StudentSchema);
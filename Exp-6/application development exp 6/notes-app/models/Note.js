const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title:    { type: String, trim: true, default: 'Untitled' },
    content:  { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'General' },
    color:    { type: String, trim: true, default: '#6366f1' }
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model('Note', noteSchema);

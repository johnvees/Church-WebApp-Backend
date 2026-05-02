const mongoose = require('mongoose');
const verseSchema = new mongoose.Schema({
  text_id: { type: String, required: true },
  text_en: { type: String, required: true },
  reference_id: { type: String, required: true },
  reference_en: { type: String, required: true },
  date: { type: String, required: true, unique: true }, // "MM-DD"
  theme_id: { type: String, default: '' },
  theme_en: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Verse', verseSchema);

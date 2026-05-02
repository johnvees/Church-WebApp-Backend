const mongoose = require('mongoose');
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  position_id: { type: String, required: true },
  position_en: { type: String, default: '' },
  department_id: { type: String, default: '' },
  department_en: { type: String, default: '' },
  photo: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  order: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  isActive: { type: Boolean, default: true },
  period: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Member', memberSchema);

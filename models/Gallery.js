const mongoose = require('mongoose');
const gallerySchema = new mongoose.Schema({
  title_id: { type: String, required: true, trim: true },
  title_en: { type: String, default: '' },
  description_id: { type: String, default: '' },
  description_en: { type: String, default: '' },
  photos: [{
    url: { type: String, required: true },
    caption_id: { type: String, default: '' },
    caption_en: { type: String, default: '' },
    publicId: { type: String, default: '' },
  }],
  coverImage: { type: String, default: '' },
  eventDate: { type: Date, default: null },
  category: { type: String, enum: ['ibadah','kegiatan','pelatihan','sosial','lainnya'], default: 'lainnya' },
  isPublished: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Gallery', gallerySchema);

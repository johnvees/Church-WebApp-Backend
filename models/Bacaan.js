const mongoose = require('mongoose');
const slugify = require('slugify');
const bacaanSchema = new mongoose.Schema({
  title_id: { type: String, required: true, trim: true },
  title_en: { type: String, default: '' },
  slug: { type: String, unique: true },
  category: { type: String, required: true, enum: ['berita-misi','sekolah-sabat','pelayanan-perorangan','bacaan-persembahan','cerita-anak','perpustakaan','liturgi-sabat'] },
  content_id: { type: String, default: '' },
  content_en: { type: String, default: '' },
  excerpt_id: { type: String, default: '', maxlength: 300 },
  excerpt_en: { type: String, default: '', maxlength: 300 },
  coverImage: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  externalLink: { type: String, default: '' },
  quarter: { type: String, default: '' },
  sabbathDate: { type: Date, default: null },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  views: { type: Number, default: 0 },
}, { timestamps: true });
bacaanSchema.pre('save', function(next) {
  if (this.isModified('title_id')) this.slug = slugify(this.title_id, { lower: true, strict: true }) + '-' + Date.now();
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) this.publishedAt = new Date();
  next();
});
module.exports = mongoose.model('Bacaan', bacaanSchema);

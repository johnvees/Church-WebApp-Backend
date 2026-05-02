const mongoose = require('mongoose');
const slugify = require('slugify');
const articleSchema = new mongoose.Schema({
  title_id: { type: String, required: true, trim: true },
  title_en: { type: String, default: '' },
  slug: { type: String, unique: true },
  content_id: { type: String, required: true },
  content_en: { type: String, default: '' },
  excerpt_id: { type: String, default: '', maxlength: 300 },
  excerpt_en: { type: String, default: '', maxlength: 300 },
  coverImage: { type: String, default: '' },
  tags: { type: [String], default: [] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  views: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });
articleSchema.pre('save', function(next) {
  if (this.isModified('title_id')) this.slug = slugify(this.title_id, { lower: true, strict: true }) + '-' + Date.now();
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) this.publishedAt = new Date();
  next();
});
module.exports = mongoose.model('Article', articleSchema);

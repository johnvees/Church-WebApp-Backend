const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

// @route   GET /api/articles
// @desc    Get all published articles
// @access  Public
router.get('/', async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.tag) filter.tags = req.query.tag;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  const total = await Article.countDocuments(filter);
  const articles = await Article.find(filter)
    .populate('author', 'name photo')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: articles.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: articles,
  });
});

// @route   GET /api/articles/featured
// @desc    Get featured articles (for landing page)
// @access  Public
router.get('/featured', async (req, res) => {
  const articles = await Article.find({ isPublished: true, isFeatured: true })
    .populate('author', 'name')
    .sort({ publishedAt: -1 })
    .limit(3);
  res.status(200).json({ success: true, data: articles });
});

// @route   GET /api/articles/admin
// @desc    Get all articles (admin panel)
// @access  Private
router.get('/admin', protect, async (req, res) => {
  const articles = await Article.find()
    .populate('author', 'name')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: articles.length, data: articles });
});

// @route   GET /api/articles/:slug
// @desc    Get single article
// @access  Public
router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({
    slug: req.params.slug,
    isPublished: true,
  }).populate('author', 'name photo position');

  if (!article) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });

  article.views += 1;
  await article.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: article });
});

// @route   POST /api/articles
// @desc    Create article
// @access  Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  req.body.author = req.user.id;
  const article = await Article.create(req.body);
  res.status(201).json({ success: true, data: article });
});

// @route   POST /api/articles/upload-image
// @desc    Upload cover image
// @access  Private
router.post('/upload-image', protect, uploadImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  res.status(200).json({ success: true, url: req.file.path });
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!article) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
  res.status(200).json({ success: true, data: article });
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Artikel berhasil dihapus' });
});

module.exports = router;

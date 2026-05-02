const express = require('express');
const router = express.Router();
const Bacaan = require('../models/Bacaan');
const { protect, authorize, canManageSection } = require('../middleware/auth');
const { uploadImage, uploadDocument } = require('../config/cloudinary');

// @route   GET /api/bacaan
// @desc    Get all published bacaan (with optional category filter)
// @access  Public
router.get('/', async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.quarter) filter.quarter = req.query.quarter;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Bacaan.countDocuments(filter);
  const bacaan = await Bacaan.find(filter)
    .populate('author', 'name')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: bacaan.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: bacaan,
  });
});

// @route   GET /api/bacaan/admin
// @desc    Get all bacaan including unpublished (admin/anggota)
// @access  Private
router.get('/admin', protect, async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;

  // Anggota can only see their assigned sections
  if (req.user.role === 'anggota') {
    filter.category = { $in: req.user.assignedSections };
  }

  const bacaan = await Bacaan.find(filter)
    .populate('author', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bacaan.length, data: bacaan });
});

// @route   GET /api/bacaan/:slug
// @desc    Get single bacaan by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  const bacaan = await Bacaan.findOne({
    slug: req.params.slug,
    isPublished: true,
  }).populate('author', 'name photo');

  if (!bacaan) {
    return res.status(404).json({ success: false, message: 'Konten tidak ditemukan' });
  }

  // Increment views
  bacaan.views += 1;
  await bacaan.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: bacaan });
});

// @route   POST /api/bacaan
// @desc    Create bacaan
// @access  Private (admin or anggota with section access)
router.post('/', protect, async (req, res, next) => {
  const { category } = req.body;
  if (req.user.role === 'anggota' && !req.user.assignedSections.includes(category)) {
    return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke bagian ini' });
  }
  req.body.author = req.user.id;
  const bacaan = await Bacaan.create(req.body);
  res.status(201).json({ success: true, data: bacaan });
});

// @route   POST /api/bacaan/upload-image
// @desc    Upload cover image
// @access  Private
router.post('/upload-image', protect, uploadImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  res.status(200).json({ success: true, url: req.file.path });
});

// @route   POST /api/bacaan/upload-document
// @desc    Upload PDF document (for perpustakaan)
// @access  Private
router.post('/upload-document', protect, uploadDocument.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  res.status(200).json({ success: true, url: req.file.path });
});

// @route   PUT /api/bacaan/:id
// @desc    Update bacaan
// @access  Private
router.put('/:id', protect, async (req, res) => {
  let bacaan = await Bacaan.findById(req.params.id);
  if (!bacaan) return res.status(404).json({ success: false, message: 'Konten tidak ditemukan' });

  // Anggota can only edit their sections
  if (req.user.role === 'anggota' && !req.user.assignedSections.includes(bacaan.category)) {
    return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke bagian ini' });
  }

  bacaan = await Bacaan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bacaan });
});

// @route   DELETE /api/bacaan/:id
// @desc    Delete bacaan
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Bacaan.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Konten berhasil dihapus' });
});

module.exports = router;

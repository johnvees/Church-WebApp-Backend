const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

// @route   GET /api/about
// @desc    Get church info
// @access  Public
router.get('/', async (req, res) => {
  let about = await About.findOne();

  // Auto-create if doesn't exist
  if (!about) {
    about = await About.create({});
  }

  res.status(200).json({ success: true, data: about });
});

// @route   PUT /api/about
// @desc    Update church info (singleton)
// @access  Admin
router.put('/', protect, authorize('admin'), async (req, res) => {
  let about = await About.findOne();

  if (!about) {
    about = await About.create(req.body);
  } else {
    about = await About.findByIdAndUpdate(about._id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({ success: true, data: about });
});

// @route   POST /api/about/upload-logo
// @desc    Upload church logo
// @access  Admin
router.post('/upload-logo', protect, authorize('admin'), uploadImage.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  res.status(200).json({ success: true, url: req.file.path });
});

// @route   POST /api/about/upload-hero
// @desc    Upload hero image
// @access  Admin
router.post('/upload-hero', protect, authorize('admin'), uploadImage.single('hero'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  res.status(200).json({ success: true, url: req.file.path });
});

module.exports = router;

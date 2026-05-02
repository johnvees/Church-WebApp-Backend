const express = require('express');
const router = express.Router();
const Verse = require('../models/Verse');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/verses/today
// @desc    Get today's verse (by month-day)
// @access  Public
router.get('/today', async (req, res) => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;

  let verse = await Verse.findOne({ date: dateKey, isActive: true });

  // Fallback: if no verse for today, get a random one
  if (!verse) {
    const count = await Verse.countDocuments({ isActive: true });
    const random = Math.floor(Math.random() * count);
    verse = await Verse.findOne({ isActive: true }).skip(random);
  }

  res.status(200).json({ success: true, data: verse });
});

// @route   GET /api/verses
// @desc    Get all verses (admin)
// @access  Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  const verses = await Verse.find().sort({ date: 1 });
  res.status(200).json({ success: true, count: verses.length, data: verses });
});

// @route   POST /api/verses
// @desc    Create a verse
// @access  Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  const verse = await Verse.create(req.body);
  res.status(201).json({ success: true, data: verse });
});

// @route   PUT /api/verses/:id
// @desc    Update a verse
// @access  Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const verse = await Verse.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!verse) return res.status(404).json({ success: false, message: 'Ayat tidak ditemukan' });
  res.status(200).json({ success: true, data: verse });
});

// @route   DELETE /api/verses/:id
// @desc    Delete a verse
// @access  Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Verse.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Ayat berhasil dihapus' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

// @route   GET /api/members
// @desc    Get all active members (organized by level for org chart)
// @access  Public
router.get('/', async (req, res) => {
  const members = await Member.find({ isActive: true })
    .populate('parentId', 'name position_id')
    .sort({ level: 1, order: 1 });

  res.status(200).json({ success: true, count: members.length, data: members });
});

// @route   GET /api/members/all
// @desc    Get all members including inactive (admin)
// @access  Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
  const members = await Member.find()
    .populate('parentId', 'name position_id')
    .sort({ level: 1, order: 1 });

  res.status(200).json({ success: true, count: members.length, data: members });
});

// @route   POST /api/members
// @desc    Create a member
// @access  Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  const member = await Member.create(req.body);
  res.status(201).json({ success: true, data: member });
});

// @route   POST /api/members/upload-photo
// @desc    Upload member photo
// @access  Admin
router.post('/upload-photo', protect, authorize('admin'), uploadImage.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  res.status(200).json({ success: true, url: req.file.path });
});

// @route   PUT /api/members/:id
// @desc    Update a member
// @access  Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!member) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
  res.status(200).json({ success: true, data: member });
});

// @route   PUT /api/members/reorder
// @desc    Bulk update order (drag and drop in admin)
// @access  Admin
router.put('/reorder', protect, authorize('admin'), async (req, res) => {
  const { updates } = req.body; // [{ id, order }]
  const ops = updates.map(({ id, order }) => ({
    updateOne: { filter: { _id: id }, update: { order } },
  }));
  await Member.bulkWrite(ops);
  res.status(200).json({ success: true, message: 'Urutan berhasil diperbarui' });
});

// @route   DELETE /api/members/:id
// @desc    Delete a member
// @access  Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Anggota berhasil dihapus' });
});

module.exports = router;

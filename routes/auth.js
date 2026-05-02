const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      position: user.position,
      assignedSections: user.assignedSections,
    },
  });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Akun Anda telah dinonaktifkan' });
  }

  sendTokenResponse(user, 200, res);
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @route   PUT /api/auth/updatepassword
// @desc    Update password
// @access  Private
router.put('/updatepassword', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Password saat ini salah' });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @route   PUT /api/auth/updateprofile
// @desc    Update profile (name, photo)
// @access  Private
router.put('/updateprofile', protect, async (req, res) => {
  const fieldsToUpdate = { name: req.body.name, photo: req.body.photo };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

// ============ ADMIN ONLY ROUTES ============

// @route   POST /api/auth/register
// @desc    Register new user (admin only)
// @access  Admin
router.post('/register', protect, authorize('admin'), async (req, res) => {
  const { name, email, password, role, assignedSections, position } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'anggota',
    assignedSections: assignedSections || [],
    position: position || '',
  });

  res.status(201).json({
    success: true,
    message: `Akun untuk ${name} berhasil dibuat`,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @route   PUT /api/auth/users/:id
// @desc    Update user (role, sections, active status)
// @access  Admin
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  const { role, assignedSections, isActive, position } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, assignedSections, isActive, position },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }

  res.status(200).json({ success: true, data: user });
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  if (req.params.id === req.user.id.toString()) {
    return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'User berhasil dihapus' });
});

module.exports = router;

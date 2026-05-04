const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, cloudinary } = require('../config/cloudinary');

// @route   GET /api/gallery
// @desc    Get all published galleries
// @access  Public
router.get('/', async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  const total = await Gallery.countDocuments(filter);
  const galleries = await Gallery.find(filter)
    .sort({ eventDate: -1 })
    .skip(skip)
    .limit(limit)
    .select('-photos'); // Don't return all photos in list view

  res.status(200).json({
    success: true,
    count: galleries.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: galleries,
  });
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery with all photos
// @access  Public
router.get('/:id', async (req, res) => {
  const gallery = await Gallery.findOne({ _id: req.params.id, isPublished: true });
  if (!gallery) return res.status(404).json({ success: false, message: 'Album tidak ditemukan' });
  res.status(200).json({ success: true, data: gallery });
});

// @route   GET /api/gallery/admin/all
// @desc    Get all galleries (admin)
// @access  Private
router.get('/admin/all', protect, async (req, res) => {
  const galleries = await Gallery.find().sort({ createdAt: -1 }).select('-photos');
  res.status(200).json({ success: true, count: galleries.length, data: galleries });
});

// @route   GET /api/gallery/admin/sign-upload
// @desc    Return a signed Cloudinary upload signature so the frontend can upload directly
// @access  Admin
router.get('/admin/sign-upload', protect, authorize('admin'), (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: 'ekklesia', timestamp };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  res.json({
    success: true,
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: 'ekklesia',
  });
});

// @route   POST /api/gallery/:id/photos/batch
// @desc    Save photos uploaded directly to Cloudinary (array of {url, publicId})
// @access  Admin
router.post('/:id/photos/batch', protect, authorize('admin'), async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  if (!gallery) return res.status(404).json({ success: false, message: 'Album tidak ditemukan' });

  const { photos } = req.body;
  if (!photos?.length) return res.status(400).json({ success: false, message: 'No photos provided' });

  const newPhotos = photos.map(p => ({ url: p.url, publicId: p.publicId, caption_id: '', caption_en: '' }));
  gallery.photos.push(...newPhotos);
  if (!gallery.coverImage) gallery.coverImage = newPhotos[0].url;
  await gallery.save();

  res.json({ success: true, data: gallery });
});

// @route   POST /api/gallery
// @desc    Create gallery album
// @access  Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  req.body.uploadedBy = req.user.id;
  const gallery = await Gallery.create(req.body);
  res.status(201).json({ success: true, data: gallery });
});

// @route   POST /api/gallery/:id/photos
// @desc    Upload photos to a gallery album
// @access  Admin
router.post(
  '/:id/photos',
  protect,
  authorize('admin'),
  uploadImage.array('photos', 20), // max 20 photos at once
  async (req, res) => {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ success: false, message: 'Album tidak ditemukan' });

    const newPhotos = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      caption_id: '',
      caption_en: '',
    }));

    gallery.photos.push(...newPhotos);
    if (!gallery.coverImage && newPhotos.length > 0) {
      gallery.coverImage = newPhotos[0].url;
    }
    await gallery.save();

    res.status(200).json({ success: true, data: gallery });
  }
);

// @route   DELETE /api/gallery/:id/photos/:photoId
// @desc    Delete a single photo from a gallery
// @access  Admin
router.delete('/:id/photos/:photoId', protect, authorize('admin'), async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  if (!gallery) return res.status(404).json({ success: false, message: 'Album tidak ditemukan' });

  const photo = gallery.photos.id(req.params.photoId);
  if (!photo) return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });

  // Delete from Cloudinary
  if (photo.publicId) {
    await cloudinary.uploader.destroy(photo.publicId);
  }

  photo.deleteOne();
  await gallery.save();

  res.status(200).json({ success: true, message: 'Foto berhasil dihapus' });
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery info
// @access  Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const gallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!gallery) return res.status(404).json({ success: false, message: 'Album tidak ditemukan' });
  res.status(200).json({ success: true, data: gallery });
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery album and all its photos
// @access  Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  if (!gallery) return res.status(404).json({ success: false, message: 'Album tidak ditemukan' });

  // Delete all photos from Cloudinary
  for (const photo of gallery.photos) {
    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId);
    }
  }

  await gallery.deleteOne();
  res.status(200).json({ success: true, message: 'Album berhasil dihapus' });
});

module.exports = router;

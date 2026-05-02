const express = require('express');
const router = express.Router();
const User = require('../models/User');
const About = require('../models/About');

// One-time seed route — DISABLE after first use by removing this file
// GET /api/seed?key=YOUR_SEED_KEY
router.get('/', async (req, res) => {
  const key = req.query.key;
  if (!key || key !== process.env.SEED_KEY) {
    return res.status(403).json({ success: false, message: 'Invalid seed key' });
  }

  const results = [];

  // Create admin
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    results.push('Admin already exists: ' + existing.email);
  } else {
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });
    results.push('Admin created: ' + admin.email);
  }

  // Create default about
  const existingAbout = await About.findOne();
  if (!existingAbout) {
    await About.create({
      churchName_id: 'GMAHK Ekklesia',
      churchName_en: 'Ekklesia SDA Church',
      tagline_id: 'Bertumbuh dalam Iman, Melayani dengan Kasih',
      tagline_en: 'Growing in Faith, Serving with Love',
      vision_id: 'Menjadi jemaat yang bertumbuh dalam iman kepada Tuhan Yesus Kristus.',
      vision_en: 'To be a congregation growing in faith in Jesus Christ.',
      mission_id: ['Beribadah kepada Tuhan', 'Memberitakan Injil', 'Melayani sesama dengan kasih'],
      mission_en: ['Worship God wholeheartedly', 'Proclaim the Gospel', 'Serve others with love'],
      serviceSchedule_id: 'Sabtu, 09.00 - 12.00 WIB',
      serviceSchedule_en: 'Saturday, 9:00 AM - 12:00 PM',
    });
    results.push('About data created');
  } else {
    results.push('About already exists');
  }

  res.json({ success: true, results });
});

module.exports = router;

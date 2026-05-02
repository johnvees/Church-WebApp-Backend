// utils/seed.js
// Run this ONCE to create the first admin account
// Command: node utils/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const About = require('../models/About');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  try {
    // Create admin user
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('⚠️  Admin sudah ada:', existingAdmin.email);
    } else {
      const admin = await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('✅ Admin berhasil dibuat:', admin.email);
    }

    // Create default about data
    const existingAbout = await About.findOne();
    if (!existingAbout) {
      await About.create({
        churchName_id: 'GMAHK Ekklesia',
        churchName_en: 'Ekklesia SDA Church',
        tagline_id: 'Bertumbuh dalam Iman, Melayani dengan Kasih',
        tagline_en: 'Growing in Faith, Serving with Love',
        vision_id: 'Menjadi jemaat yang bertumbuh dalam iman kepada Tuhan Yesus Kristus.',
        vision_en: 'To be a congregation growing in faith in Jesus Christ.',
        mission_id: [
          'Beribadah kepada Tuhan dengan sepenuh hati',
          'Memberitakan Injil kepada semua orang',
          'Melayani sesama dengan kasih',
        ],
        mission_en: [
          'Worship God wholeheartedly',
          'Proclaim the Gospel to everyone',
          'Serve others with love',
        ],
        serviceSchedule_id: 'Sabtu, 09.00 - 12.00 WIB',
        serviceSchedule_en: 'Saturday, 9:00 AM - 12:00 PM',
      });
      console.log('✅ Data About berhasil dibuat');
    } else {
      console.log('⚠️  Data About sudah ada');
    }

    console.log('\n🎉 Seeding selesai!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seed();

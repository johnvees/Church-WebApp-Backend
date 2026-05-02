const mongoose = require('mongoose');
const aboutSchema = new mongoose.Schema({
  churchName_id: { type: String, default: 'GMAHK Ekklesia' },
  churchName_en: { type: String, default: 'Ekklesia SDA Church' },
  tagline_id: { type: String, default: '' },
  tagline_en: { type: String, default: '' },
  history_id: { type: String, default: '' },
  history_en: { type: String, default: '' },
  vision_id: { type: String, default: '' },
  vision_en: { type: String, default: '' },
  mission_id: { type: [String], default: [] },
  mission_en: { type: [String], default: [] },
  address: { type: String, default: '' },
  googleMapsUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  socialMedia: {
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
  },
  serviceSchedule_id: { type: String, default: '' },
  serviceSchedule_en: { type: String, default: '' },
  heroImages: { type: [String], default: [] },
  logoUrl: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('About', aboutSchema);

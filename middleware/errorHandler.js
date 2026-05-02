const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} sudah digunakan.` });
  }
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: msg });
  }
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Token tidak valid' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Sesi berakhir, login kembali' });
  res.status(err.statusCode || 500).json({ success: false, message: error.message || 'Terjadi kesalahan server' });
};

module.exports = errorHandler;

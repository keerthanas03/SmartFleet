const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
};

const staffOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Staff or Administrator privileges required',
    });
  }
};

module.exports = {
  adminOnly,
  staffOnly,
};

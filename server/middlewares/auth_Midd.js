// >> קובץ: middlewares/auth_Midd.js
// >> תיקון: וידוא ש-req.user מכיל את כל הפרטים שהלקוח צריך.

const jwt = require('jsonwebtoken');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const userModel = require('../models/user_M');

const jwtSecret = process.env.jwtSecret;

// ... (קוד ה-rate limiter נשאר זהה) ...
const rateLimiter = new RateLimiterMemory({ points: 6, duration: 3 * 60 });
const checkLoginRateLimit = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.connection.remoteAddress);
    next();
  } catch {
    res.status(429).json({ message: "Too many login attempts" });
  }
};


const isLoggedIn = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    // במקום then, נשתמש ב-await ישירות כדי לשפר קריאות
    const [rows] = await userModel.getById(decoded.id);
    const user = rows[0];

    if (!user) return res.status(401).json({ message: "User not found" });

    // FIX: בונים אובייקט משתמש מלא, זהה למה שמוחזר ב-login
    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      roles: userModel.getRolesFromFlags(user)
    };

    next();
  });
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: "Access denied" });
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

module.exports = {
  checkLoginRateLimit,
  isLoggedIn,
  requireRole,
};

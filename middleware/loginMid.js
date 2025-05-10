const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const db = require("../database");
require("dotenv").config();

const Salt = process.env.Salt;
const jwtSecret = process.env.jwtSecret;

const rateLimiter = new RateLimiterMemory({
  points: 6,
  duration: 3 * 60,
});

function EncWithSalt(str) {
  return md5(Salt + str);
}

async function check_login(req, res, next) {
  let points = -3;

  try {
    const rateLimiterRes = await rateLimiter.consume(
      req.connection.remoteAddress,
      1
    );
    points = rateLimiterRes.remainingPoints;
  } catch {
    points = 0;
  }

  if (points > 0) {
    await CheckUser(req, res);
    if (res.loggedEn) {
      SetLoginToken(req, res);
    }
  } else {
    res.loggedEn = false;
  }

  next();
}

async function CheckUser(req, res) {
  const { userName, pass } = req.body;
  const encPass = EncWithSalt(pass);
  res.loggedEn = false;
  let rows = [];
  try {
    [rows] = await db.query(
      "SELECT * FROM users WHERE userName = ? AND password_hash = ?",
      [userName, encPass]
    );
  } catch (err) {
    res.status(500).json({ message: "שגיאה בבסיס הנתונים" });
  }
  if (rows.length > 0) {
    const user = rows[0];

    // יצירת role לפי העדיפות
    let role = "guest";
    if (user.is_admin) role = "admin";
    else if (user.is_trainer) role = "trainer";
    else if (user.is_member) role = "member";

    user.role = role;
    res.loggedEn = true;
    req.user = user;
  }
}

function SetLoginToken(req, res) {
  const maxAge = 3 * 60 * 60;

  // שמירת session בשרת
  req.session.user = {
    id: req.user.id,
    name: req.user.full_name,
    role: req.user.role
  };

  // JWT שומר רק את ה־ID
  const token = jwt.sign({ id: req.user.id }, jwtSecret, { expiresIn: maxAge });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: maxAge * 1000,
  });

  res.token = token;
}

function isLogged(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) return res.redirect("/login");

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err || !decoded?.id) return res.redirect("/login");

    // נוודא שה־session תואם ל־JWT
    if (req.session.user && req.session.user.id === decoded.id) {
      req.user = req.session.user;
      return next();
    }

    return res.redirect("/login");
  });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).render("error", {
        title: "אין הרשאה",
        message: "אין לך הרשאה לגשת לעמוד זה."
      });
    }
    next();
  };
}

module.exports = {
  EncWithSalt,
  check_login,
  isLogged,
  requireRole
};

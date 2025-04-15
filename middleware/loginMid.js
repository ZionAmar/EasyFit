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
    const rateLimiterRes = await rateLimiter.consume(req.connection.remoteAddress, 1);
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

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE userName = ? AND password_hash = ?",
      [userName, encPass]
    );
    if (rows.length > 0) {
      res.loggedEn = true;
      req.user = rows[0];
    }
  } catch (err) {
    res.status(500).json({ message: "שגיאה בבסיס הנתונים" });
  }
}

function SetLoginToken(req, res) {
  const maxAge = 3 * 60 * 60;
  const token = jwt.sign(
    { id: req.user.id, name: req.user.name },
    jwtSecret,
    { expiresIn: maxAge }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: maxAge * 1000,
  });

  res.token = token;
}

function isLogged(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) return res.redirect("/login");

  jwt.verify(token, jwtSecret, (err) => {
    if (err) return res.redirect("/login");
    next();
  });
}

module.exports = {
  EncWithSalt,
  check_login,
  isLogged,
};

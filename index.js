const express = require("express");
const app = express();
const port = 4060;
const dotenv = require("dotenv");
dotenv.config();
const body_parser = require("body-parser");
const path = require("path");
const middle=require("./middleware/loginMid");
app.use(body_parser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, './')));
const cookieParser = require('cookie-parser');
const session = require("express-session");
app.use(cookieParser());
// הגדרת session
app.use(session({
  secret: process.env.jwtSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// middleware שמכניס את המשתמש לתוך res.locals
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    res.locals.user = req.session.user;
  }
  next();
});
//Routes
app.get("/",[middle.isLogged], (req, res) => {
  res.render("main", { title: "EasyFit - דף הבית", header: "דף הבית" });
});
const users = require("./routers/users");
app.use("/users",[middle.isLogged], users);
const meetings = require("./routers/meetings");
app.use("/meetings",[middle.isLogged], meetings);
const rooms = require("./routers/rooms");
app.use("/rooms",[middle.isLogged], rooms);
const participation = require("./routers/participation");
app.use("/participation",[middle.isLogged], participation);
const calendar = require("./routers/calendar");
app.use("/calendar",[middle.isLogged], calendar);
const register = require('./routers/register');
app.use('/register',register);
const login = require('./routers/login');
app.use('/login',login);
app.get('/logout', (req, res) => {
  res.clearCookie('jwt'); // מוחק את העוגייה
  res.redirect('/login'); // מפנה למסך התחברות
});




app.listen(port, () => {
  console.log(`EasyFit server is running at http://localhost:${port}`);
});

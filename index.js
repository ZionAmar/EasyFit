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
app.use(cookieParser());

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




app.listen(port, () => {
  console.log(`EasyFit server is running at http://localhost:${port}`);
});

const express = require("express");
const app = express();
const port = 4060;
const dotenv = require("dotenv");
dotenv.config();
const body_parser = require("body-parser");
const path = require("path");
app.use(body_parser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, './')));

//Routes
app.get("/", (req, res) => {
  res.render("main", { title: "EasyFit - דף הבית", header: "דף הבית" });
});
const users = require("./routes/users");
app.use("/users", users);
const meetings = require("./routes/meetings");
app.use("/meetings", meetings);
const rooms = require("./routes/rooms");
app.use("/rooms", rooms);
const participation = require("./routes/participation");
app.use("/participation", participation);
const calendar = require("./routes/calendar");
app.use("/calendar", calendar);

app.listen(port, () => {
  console.log(`EasyFit server is running at http://localhost:${port}`);
});

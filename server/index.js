const express = require('express');
const app = express();
const port = 3000;
const dotenv = require("dotenv");
dotenv.config();
const body_parser = require('body-parser');
const path = require('path');
app.use(body_parser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 

//Routes
app.get('/',(req,res)=>{
    res.render('main',{ title: "EasyFit - דף הבית" , header: "דף הבית"})
});
const users = require('./routes/users');
app.use('/users', users);



app.listen(port, () => {
    console.log(`EasyFit server is running at http://localhost:${port}`);
});

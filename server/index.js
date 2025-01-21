const express = require('express');
const app = express();
const port = 3000;

//Routes
const home = require('./routes/home');
app.use('/', home);




app.listen(port, () => {
    console.log(`EasyFit server is running at http://localhost:${port}`);
});

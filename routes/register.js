const express = require('express');
const router = express.Router();
module.exports = router;

const middleReg=require("../middleware/registerMid");

router.get("/",(req, res) => {
    res.render("register", {title:"registerPage", header:"registerPage"});
});

router.post("/List",[middleReg.getList],function (req,res,next){
});

router.post("/Add",[middleReg.addUser],function (req,res,next){
});

router.post("/Update",[middleReg.updateUser],function(req, res,next ){
});

router.delete("/Delete",[middleReg.delUser],function (req, res,next){
});


const express=require("express");
const cors=require("cors");
const app=express();
const path = require("path");

app.get("/", (req, res) => {
  res.status(200).send("Finlytics API is running!!!!!!!!!!!!!!");
});


module.exports=app;
const app=require("./app.js");
const mongoose=require("mongoose");
require('dotenv').config();

const PORT = process.env.PORT || 8080;
const MONGO_URL= process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.listen(PORT,()=>{
    console.log(`server is listening to ${PORT}`);
});

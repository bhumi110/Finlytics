const express=require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app=express();
const path = require("path");


/* Middlewares */
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const expenseRoutes = require("./routes/expence.routes");
app.use("/expense", expenseRoutes);



app.get("/", (req, res) => {
  res.status(200).send("Finlytics API is running!!!!!!!");
});


module.exports=app;
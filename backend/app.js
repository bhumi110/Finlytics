const express=require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app=express();
const path = require("path");

app.use(express.json());
app.use(cors({
  origin: [ "https://finlytics-tau.vercel.app/"],
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const expenseRoutes = require("./routes/expence.routes");
app.use("/expense", expenseRoutes);

const employeeRoutes = require("./routes/employee.routes");
app.use("/employee", employeeRoutes);

const managerRoutes = require("./routes/manager.routes");
app.use("/manager", managerRoutes);

app.use("/admin", require("./routes/admin.routes"));

app.use("/finance",require("./routes/finance.routes"));

app.get("/", (req, res) => {
  res.status(200).send("Finlytics API is running!!!!!!!");
});


module.exports=app;
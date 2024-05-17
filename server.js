const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
dotenv.config();

mongoose
  .connect(process.env.BSMS_MONGO_URL)
  .then((_result) => console.log("database connected"))
  .catch((err) => console.log(err));

const AuthRoute = require("./routes/auth");
const docRoute = require("./routes/Doc");
const HouseRoutes = require("./routes/HouseRoutes");
const brokerCompaniesRoutes = require("./routes/brokerCompaniesRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const landRoutes = require("./routes/landRoutes");
const employee = require("./routes/employeeRoutes");
const Message = require("./routes/MessageRoute");
const Chat = require("./routes/ChatRoute");
const Notification = require("./routes/Notify");
const paymentRoute = require("./routes/paymentRoute");
const Allproperty = require("./routes/Allproperty");
const commissionroutes = require("./routes/commissionroutes");
const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use("/api/docs", docRoute);
app.use("/api/User", AuthRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/House", HouseRoutes);
app.use("/api/Vehicle", vehicleRoutes);
app.use("/api/Land", landRoutes);
app.use("/api/Employee", employee);
app.use("/api/Message", Message);
app.use("/api/Chat", Chat);
app.use("/api/Notification", Notification);
app.use("/api/brokerCompanies", brokerCompaniesRoutes);
app.use("/api/Allproperty", Allproperty);
app.use("/api/commission", commissionroutes);

app.listen(3001, () => {
  console.log("Node API App is running on port 3001 ");
});

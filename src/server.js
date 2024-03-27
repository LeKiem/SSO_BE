require("dotenv").config();
import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRouters from "./routes/web";
import initApiRouters from "./routes/api";
import configCors from "./config/cors";
import bodyParser from "body-parser";
import connection from "./config/connectDB";
import cookieParser from "cookie-parser";
import { configPassport } from "./controller/passportController";
import configSession from "./config/session";
import flash from "connect-flash";
import configLoginWithGoogle from "./controller/social/GoogleController";
import configLoginWithFacebook from "./controller/social/FacebookController";
const app = express();
const PORT = process.env.PORT || 8080;

//config flass
app.use(flash());

//Config Cors
configCors(app);
connection();

configViewEngine(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
configSession(app);
//test jwt
// createJWT();
// let decodeData = verifyToken(
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW1lIjoiYmFyIiwiYWRkcmVzcyI6IkhOIiwiaWF0IjoxNzA2MzU4MTI3fQ.Z_VKh3r0F7QzFAcgeGqzcDKJXfiqfo1CnFNI0BitCPU"
// );

// console.log(decodeData);

initWebRouters(app);
initApiRouters(app);
app.use((req, res) => {
  return res.send("404");
});

configPassport();
configLoginWithGoogle();
configLoginWithFacebook();
app.listen(PORT, () => {
  console.log("JWT Backend is running on the port = " + PORT);
});

import express, { Application } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import router from "./routes/index";
import { initializePassport, sessionPassport } from "./config/passport";
import session from "express-session";

dotenv.config();

const app: Application = express();
app.use(initializePassport());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(sessionPassport());
app.use(bodyParser.json());
app.use("/api", router);

export default app;

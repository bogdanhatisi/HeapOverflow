import express, { Application } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import router from "./routes/index";

dotenv.config();

const app: Application = express();

app.use(bodyParser.json());
app.use("/api", router);

export default app;

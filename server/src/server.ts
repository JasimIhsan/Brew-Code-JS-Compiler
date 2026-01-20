import express, { Request, Response } from "express";
import dotenv from 'dotenv'
import { env } from "./config/env.config";
import { validateEnv } from "./utils/validate-env.util";

dotenv.config()
const app = express();
const PORT = env.PORT;
validateEnv()

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Backend!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
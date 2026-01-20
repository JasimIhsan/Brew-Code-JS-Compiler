import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { env } from "./config/env.config";
import { ExecutorService } from "./services/execute.service";
import { validateEnv } from "./utils/validate-env.util";

dotenv.config();
const app = express();
const PORT = env.PORT || 4000;
validateEnv();

app.use(cors());
app.use(express.json());

const executorService = new ExecutorService();

app.get("/", (req: Request, res: Response) => {
   res.send("Hello, TypeScript Backend!");
});

app.post("/run", async (req: Request, res: Response): Promise<void> => {
   const { code } = req.body;

   if (!code) {
      res.status(400).json({ error: "Code is required" });
      return;
   }

   const result = await executorService.execute(code);
   res.json(result);
});

app.listen(PORT, () => {
   console.log(`Server running : ✅✅✅`);
});

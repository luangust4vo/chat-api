import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { router } from "./src/routes/router";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(router);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});

import { Router } from "express";

import { createUser } from "../controllers/user.controller";

const router = Router();

router.get("/register", createUser);

export { router as userRoutes };

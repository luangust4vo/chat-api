import { Router } from "express";

import {
  createUser,
  loginUser,
  changeUserPass,
} from "../controllers/user.controller";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/change-pass", changeUserPass);

export { router as userRoutes };

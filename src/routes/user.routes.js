import { Router } from "express";

import {
  createUser,
  loginUser,
  changeUserPass,
  getUsers,
  getUser,
} from "../controllers/user.controller";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/change-pass", changeUserPass);
router.get("/", getUsers);
router.get("/find/:userId", getUser);

export { router as userRoutes };

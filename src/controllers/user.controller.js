import jwt from "jsonwebtoken";

import { User } from "../models/user.model";

const genToken = (id) => {
  const jwtKey = process.env.JWT_SECRET_KEY;

  return jwt.sign({ id }, jwtKey, { expiresIn: "3d" });
};

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);

    if (!user || !user.data) return res.status(400).json(user.errors);

    const data = await user.create();

    if (!data || user.errors.length > 0)
      return res.status(400).json(user.errors);

    const { id, name, email } = data;

    const token = genToken(id);

    res.status(200).json({ id, name, email, token });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

export const loginUser = async (req, res) => {
  try {
    const user = new User(req.body, true);

    if (!user || !user.data) return res.status(400).json(user.errors);

    const data = await user.login();

    if (!data || user.errors.length > 0)
      return res.status(400).json(user.errors);

    const { id, name, email } = data;

    const token = genToken(id);

    res.status(200).json({ id, name, email, token });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

export const changeUserPass = async (req, res) => {
  try {
    const user = new User(req.body, true);

    if (!user || !user.data) return res.status(400).json(user.errors);

    const data = await user.changePass();

    if (!data || user.errors.length > 0)
      return res.status(400).json(user.errors);

    const { id, name, email } = data;

    res.status(200).json({ id, name, email });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

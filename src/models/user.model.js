import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "../services/prisma";

const userRegisterSchema = z.object({
  name: z.string().trim().min(3, "O nome deve ter, no mínimo, 3 caracteres"),
  email: z.string().trim().email("Email inválido"),
  password: z
    .string()
    .trim()
    .min(6, "A senha precisa ter, no mínimo, 6 caracteres"),
});

const userLoginSchema = userRegisterSchema.partial({
  name: true,
});

export class User {
  constructor(data, isLogin = false) {
    this.errors = [];
    this._user = null;
    this._isLogin = isLogin;
    this.data = this._validate(data);
  }

  _validate(data) {
    if (this._isLogin) {
      if (data.email === "" || data.password === "") {
        this.errors.push({ message: "Todos os campos são obrigatórios" });
        return null;
      }
    } else {
      if (data.name === "" || data.email === "" || data.password === "") {
        this.errors.push({ message: "Todos os campos são obrigatórios" });
        return null;
      }
    }

    const validation = this._isLogin
      ? userLoginSchema.safeParse(data)
      : userRegisterSchema.safeParse(data);

    if (!validation.success) {
      validation.error.errors.forEach((issue) => {
        this.errors.push({ message: issue.message });
      });

      return null;
    }

    return validation.data;
  }

  async create() {
    this._user = await this._userExists();

    if (this._user) {
      this.errors.push({ message: "O email inserido já está em uso" });
      return null;
    }

    await this._hashPass();

    this._user = await prisma.user.create({
      data: this.data,
    });

    return this._user;
  }

  async login() {
    this._user = await this._userExists();

    if (!this._user) {
      this.errors.push({ message: "Usuário não encontrado ou não existe" });
      return null;
    }

    const isValidPass = await this._verifyPass();

    if (!isValidPass) {
      this.errors.push({ message: "Senha incorreta" });
      return null;
    }

    return this._user;
  }

  async changePass() {
    this._user = await this._userExists();

    if (!this._user) {
      this.errors.push({ message: "Usuário não encontrado ou não existe" });
      return null;
    }

    await this._hashPass();

    this._user = await prisma.user.update({
      where: { email: this.data.email },
      data: this.data,
    });

    return this._user;
  }

  async _verifyPass() {
    const hashedPass = this._user.password;

    return await bcrypt.compare(this.data.password, hashedPass);
  }

  async _hashPass() {
    const pass = this.data.password;
    const salt = await bcrypt.genSalt();

    this.data.password = await bcrypt.hash(pass, salt);
  }

  async _userExists() {
    return await prisma.user.findUnique({
      where: { email: this.data.email },
    });
  }

  static async findAll(searchTerm) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: `${searchTerm}`, mode: "insensitive" } },
          { name: { startsWith: `${searchTerm}`, mode: "insensitive" } },
        ],
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
      },
    });
  }

  static async findOne(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }
}

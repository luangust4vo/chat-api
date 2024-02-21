import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "../services/prisma";

const userSchema = z.object({
  name: z.string().trim().min(3, "O nome deve ter, no mínimo, 3 caracteres"),
  email: z.string().trim().email("Email inválido"),
  password: z
    .string()
    .trim()
    .min(6, "A senha precisa ter, no mínimo, 6 caracteres"),
});

export class User {
  constructor(data) {
    this.errors = [];
    this._user = null;
    this.data = this.validate(data);
  }

  validate(data) {
    if (data.name === "" || data.email === "" || data.password === "") {
      this.errors.push({ message: "Todos os campos são obrigatórios" });
      return null;
    }

    const validation = userSchema.safeParse(data);

    if (!validation.success) {
      validation.error.errors.forEach((issue) => {
        this.errors.push({ message: issue.message });
      });

      return null;
    }

    return validation.data;
  }

  async create() {
    await this._emailAlreadyInUse();

    await this._hashPass();

    this._user = await prisma.user.create({
      data: this.data,
    });

    return this._user;
  }

  async _hashPass() {
    const pass = this.data.password;
    const salt = await bcrypt.genSalt();

    this.data.password = await bcrypt.hash(pass, salt);
  }

  async _emailAlreadyInUse() {
    this._user = await prisma.user.findUnique({
      where: { email: this.data.email },
    });

    if (this._user)
      this.errors.push({ message: "O email inserido já está em uso" });
  }
}

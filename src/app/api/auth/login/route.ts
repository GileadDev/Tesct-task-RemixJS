import bcrypt from "bcryptjs";
import { jsonError, readJson, validationError } from "@/lib/api";
import { loginSchema } from "@/lib/auth-schema";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/session";
import { User } from "@/models/User";

export async function POST(request: Request) {
  // 1. Проверяем, что прислали email и пароль в нужном виде
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return validationError(parsed.error);
  }
  const { email, password } = parsed.data;

  // 2. Ищем пользователя и сравниваем пароль с хешем
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  const passwordOk = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  // Одинаковый ответ для "нет такого email" и "неверный пароль":
  // так нельзя подобрать, какие email зарегистрированы
  if (!user || !passwordOk) {
    return jsonError(401, "Неверный email или пароль");
  }

  // 3. Выдаём cookie с JWT
  await createSession({ userId: user._id.toString(), email: user.email });
  return Response.json({ ok: true });
}

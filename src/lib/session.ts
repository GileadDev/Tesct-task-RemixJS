import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 дней

// Что лежит внутри JWT. Пароль и другие секреты сюда не кладём!
export type SessionPayload = {
  userId: string;
  email: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET не задан. Проверьте файл .env.local");
  }
  return new TextEncoder().encode(secret);
}

// Создать подписанный токен
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

// Проверить токен. Подделан, просрочен или его нет — вернём null
export async function decrypt(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// Выдать cookie с токеном (после успешного логина)
export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript в браузере не сможет прочитать cookie
    secure: process.env.NODE_ENV === "production", // только по HTTPS на проде
    sameSite: "lax", // защита от отправки cookie с чужих сайтов
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

// Удалить cookie (логаут)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

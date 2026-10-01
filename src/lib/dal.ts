import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, decrypt } from "./session";

// Прочитать сессию из cookie. cache() — в рамках одного запроса
// токен проверяется один раз, сколько бы раз функцию ни вызвали.
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
});

// Для страниц админки: нет сессии — отправляем на /login
export async function verifySession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

import "server-only";
import type { z } from "zod";

// Единый формат ошибки для всего API: { error: "текст", issues?: [...] }
export function jsonError(status: number, error: string, issues?: unknown) {
  return Response.json({ error, issues }, { status });
}

export const unauthorized = () => jsonError(401, "Требуется вход");
export const notFound = () => jsonError(404, "Форма не найдена");

// Ошибки Zod -> понятный список "поле: сообщение"
export function validationError(error: z.ZodError) {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  return jsonError(400, "Данные не прошли проверку", issues);
}

// Тело запроса как JSON. Кривой JSON -> null (потом Zod скажет, что не так)
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

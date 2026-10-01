import { z } from "zod";
import { jsonError, readJson, unauthorized, validationError } from "@/lib/api";
import { runFormAgent } from "@/lib/ai/form-agent";
import { getSession } from "@/lib/dal";
import { fieldSchema } from "@/lib/forms/schema";

const requestSchema = z.object({
  message: z.string().trim().min(1, "Пустое сообщение").max(2000),
  fields: z.array(fieldSchema).max(100),
});

// POST /api/ai — { message, fields } -> { reply, fields }
export async function POST(request: Request) {
  if (!(await getSession())) return unauthorized();

  if (!process.env.OPENAI_API_KEY) {
    return jsonError(
      503,
      "AI не настроен: добавьте OPENAI_API_KEY в .env.local",
    );
  }

  const parsed = requestSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await runFormAgent(parsed.data.message, parsed.data.fields);
    return Response.json(result);
  } catch (error) {
    console.error("AI error:", error);
    return jsonError(
      502,
      "AI не смог выполнить запрос. Попробуйте переформулировать",
    );
  }
}

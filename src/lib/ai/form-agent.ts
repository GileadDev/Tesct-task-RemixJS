import "server-only";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { fieldSchema, type FormField } from "@/lib/forms/schema";

// Схема ответа модели. OpenAI в режиме structured output требует,
// чтобы все ключи были обязательными — поэтому "нет значения" = null.
const aiFieldSchema = z.object({
  id: z
    .string()
    .describe("id существующего поля; для нового поля пустая строка"),
  type: z.enum(["text", "number", "textarea"]),
  label: z.string(),
  placeholder: z.string().nullable(),
  required: z.boolean(),
  minLength: z.number().int().nullable(),
  maxLength: z.number().int().nullable(),
  rows: z.number().int().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  step: z.number().nullable(),
});

const aiAnswerSchema = z.object({
  reply: z.string().describe("Короткий ответ пользователю: что сделано"),
  fields: z
    .array(aiFieldSchema)
    .describe("ВСЕ поля формы после изменений, в нужном порядке"),
});

type AiField = z.infer<typeof aiFieldSchema>;

const SYSTEM_PROMPT = `Ты помощник в конструкторе веб-форм.
Пользователь просит добавить, изменить, удалить или переставить поля.

Типы полей:
- text — однострочный текст. Настройки: minLength, maxLength
- number — число. Настройки: min, max, step
- textarea — многострочный текст. Настройки: minLength, maxLength, rows

Правила:
- Верни ПОЛНЫЙ список полей после изменений.
- Поля, о которых пользователь не говорил, верни без изменений и с тем же id.
- У нового поля id — пустая строка.
- Настройки, которых нет у типа поля, ставь null.
- label и placeholder пиши на языке пользователя.
- Телефон, email, имя — это text. Возраст, количество — number.
- Если запрос не про поля формы, ничего не меняй и объясни это в reply.`;

export async function runFormAgent(message: string, fields: FormField[]) {
  const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
  });

  // withStructuredOutput: модель обязана вернуть JSON по нашей Zod-схеме
  const structuredModel = model.withStructuredOutput(aiAnswerSchema, {
    name: "update_form_fields",
  });

  const answer = await structuredModel.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Текущие поля формы (JSON):\n${JSON.stringify(fields)}\n\nЗапрос: ${message}`,
    ),
  ]);

  // Проверяем ответ модели нашей обычной схемой полей
  const knownIds = new Set(fields.map((f) => f.id));
  const usedIds = new Set<string>();
  const nextFields = answer.fields.map((aiField) => {
    const keepId = knownIds.has(aiField.id) && !usedIds.has(aiField.id);
    const id = keepId ? aiField.id : crypto.randomUUID();
    usedIds.add(id);
    return toFormField(aiField, id);
  });

  return {
    reply: answer.reply,
    fields: fieldSchema.array().parse(nextFields),
  };
}

// null -> undefined, и оставляем только настройки, подходящие типу поля
function toFormField(ai: AiField, id: string) {
  const value = (v: number | null) => v ?? undefined;
  const common = {
    id,
    label: ai.label,
    placeholder: ai.placeholder ?? undefined,
    required: ai.required,
  };

  switch (ai.type) {
    case "text":
      return {
        ...common,
        type: ai.type,
        minLength: value(ai.minLength),
        maxLength: value(ai.maxLength),
      };
    case "textarea":
      return {
        ...common,
        type: ai.type,
        minLength: value(ai.minLength),
        maxLength: value(ai.maxLength),
        rows: value(ai.rows),
      };
    case "number":
      return {
        ...common,
        type: ai.type,
        min: value(ai.min),
        max: value(ai.max),
        step: value(ai.step),
      };
  }
}

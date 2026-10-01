import { z } from "zod";

// ---------- Общие части всех полей ----------

const baseFieldShape = {
  id: z.string().min(1),
  label: z.string().trim().min(1, "Введите название поля").max(200),
  placeholder: z.string().max(200).optional(),
  required: z.boolean(),
};

// minLength / maxLength есть у text и textarea
const lengthShape = {
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
};

function lengthIsValid(field: { minLength?: number; maxLength?: number }) {
  if (field.minLength === undefined || field.maxLength === undefined) {
    return true;
  }
  return field.minLength <= field.maxLength;
}

const lengthError = {
  message: "Минимальная длина больше максимальной",
  path: ["maxLength"],
};

// ---------- Три типа полей ----------

export const textFieldSchema = z
  .object({ ...baseFieldShape, type: z.literal("text"), ...lengthShape })
  .refine(lengthIsValid, lengthError);

export const textareaFieldSchema = z
  .object({
    ...baseFieldShape,
    type: z.literal("textarea"),
    ...lengthShape,
    rows: z.number().int().min(1).max(30).optional(),
  })
  .refine(lengthIsValid, lengthError);

export const numberFieldSchema = z
  .object({
    ...baseFieldShape,
    type: z.literal("number"),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().positive("Шаг должен быть больше 0").optional(),
  })
  .refine((f) => f.min === undefined || f.max === undefined || f.min <= f.max, {
    message: "Минимум больше максимума",
    path: ["max"],
  });

// Любое поле: Zod смотрит на "type" и выбирает нужную схему
export const fieldSchema = z.discriminatedUnion("type", [
  textFieldSchema,
  numberFieldSchema,
  textareaFieldSchema,
]);

// ---------- Форма целиком ----------

export const formInputSchema = z.object({
  title: z.string().trim().min(1, "Введите название формы").max(200),
  description: z.string().trim().max(1000),
  published: z.boolean(),
  fields: z
    .array(fieldSchema)
    .max(100, "Не больше 100 полей")
    .refine(
      (fields) => new Set(fields.map((f) => f.id)).size === fields.length,
      "У полей повторяются id",
    ),
});

// ---------- Типы TypeScript, выведенные из схем ----------

export type FormField = z.infer<typeof fieldSchema>;
export type FieldType = FormField["type"];
export type FormInput = z.infer<typeof formInputSchema>;

// То, что API и страницы отдают наружу (DTO)
export type FormDTO = FormInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

// ---------- Новое поле с настройками по умолчанию ----------

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Текст",
  number: "Число",
  textarea: "Многострочный текст",
};

export function createField(type: FieldType): FormField {
  const id = crypto.randomUUID();
  switch (type) {
    case "text":
      return { id, type, label: "Текстовое поле", required: false };
    case "number":
      return { id, type, label: "Числовое поле", required: false };
    case "textarea":
      return { id, type, label: "Комментарий", required: false, rows: 4 };
  }
}

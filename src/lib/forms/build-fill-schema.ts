import { z } from "zod";
import type { FormField } from "./schema";

// Ответы пользователя: ключ — id поля, значение — введённый текст
export type FillValues = Record<string, string>;

type NumberField = Extract<FormField, { type: "number" }>;
type TextLikeField = Exclude<FormField, NumberField>;

// Собираем Zod-схему из описания полей формы (оно пришло из БД)
export function buildFillSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodString> = {};

  for (const field of fields) {
    shape[field.id] = z.string().superRefine((raw, ctx) => {
      const value = raw.trim();

      // Пустое значение: ошибка только для обязательного поля
      if (value === "") {
        if (field.required) {
          ctx.addIssue({ code: "custom", message: "Обязательное поле" });
        }
        return;
      }

      const error =
        field.type === "number"
          ? checkNumber(field, value)
          : checkText(field, value);
      if (error) {
        ctx.addIssue({ code: "custom", message: error });
      }
    });
  }

  return z.object(shape);
}

// Пустые начальные значения для всех полей
export function emptyValues(fields: FormField[]): FillValues {
  return Object.fromEntries(fields.map((field) => [field.id, ""]));
}

function checkText(field: TextLikeField, value: string): string | null {
  if (field.minLength !== undefined && value.length < field.minLength) {
    return `Минимум символов: ${field.minLength}`;
  }
  if (field.maxLength !== undefined && value.length > field.maxLength) {
    return `Максимум символов: ${field.maxLength}`;
  }
  return null;
}

function checkNumber(field: NumberField, value: string): string | null {
  const num = Number(value.replace(",", "."));
  if (!Number.isFinite(num)) return "Введите число";
  if (field.min !== undefined && num < field.min) {
    return `Число не меньше ${field.min}`;
  }
  if (field.max !== undefined && num > field.max) {
    return `Число не больше ${field.max}`;
  }
  if (field.step !== undefined) {
    // Сколько шагов от минимума (или от нуля). Должно быть целое число.
    const steps = (num - (field.min ?? 0)) / field.step;
    if (Math.abs(steps - Math.round(steps)) > 1e-9) {
      return `Значение должно идти с шагом ${field.step}`;
    }
  }
  return null;
}

import type { UseFormRegisterReturn } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormField } from "@/lib/forms/schema";

type Props = {
  field: FormField;
  // Режим превью в редакторе: поле видно, но ввести в него ничего нельзя
  preview?: boolean;
  // Режим заполнения: то, что вернул register() из react-hook-form
  inputProps?: UseFormRegisterReturn;
  error?: string;
};

export function FormFieldView({ field, preview, inputProps, error }: Props) {
  const inputId = `field-${field.id}`;
  const hint = describeLimits(field);

  // Общие атрибуты для input и textarea
  const common = {
    id: inputId,
    placeholder: field.placeholder,
    readOnly: preview,
    tabIndex: preview ? -1 : undefined,
    "aria-invalid": error ? true : undefined,
    ...inputProps,
  };

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={inputId}>
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </FieldLabel>

      {field.type === "textarea" && (
        <Textarea
          {...common}
          rows={field.rows}
          className={field.rows ? "field-sizing-fixed" : undefined}
        />
      )}

      {field.type === "text" && <Input {...common} type="text" />}

      {field.type === "number" && (
        <Input
          {...common}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step={field.step ?? "any"}
        />
      )}

      {hint && <FieldDescription>{hint}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

// Подсказка под полем: "От 2 до 50 символов", "Число от 0 до 100, шаг 5"
function describeLimits(field: FormField): string | null {
  if (field.type === "number") {
    let hint = "Число";
    if (field.min !== undefined) hint += ` от ${field.min}`;
    if (field.max !== undefined) hint += ` до ${field.max}`;
    if (field.step !== undefined) hint += `, шаг ${field.step}`;
    return hint === "Число" ? null : hint;
  }

  const { minLength, maxLength } = field;
  if (minLength !== undefined && maxLength !== undefined) {
    return `От ${minLength} до ${maxLength} символов`;
  }
  if (minLength !== undefined) return `Минимум символов: ${minLength}`;
  if (maxLength !== undefined) return `Максимум символов: ${maxLength}`;
  return null;
}

"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FIELD_TYPE_LABELS, type FormField } from "@/lib/forms/schema";

type Props = {
  field: FormField;
  onChange: (field: FormField) => void;
  onClose: () => void;
};

export function FieldSettings({ field, onChange, onClose }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки поля</CardTitle>
        <CardDescription>Тип: {FIELD_TYPE_LABELS[field.type]}</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Закрыть настройки"
          >
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          {/* --- Общие настройки для всех типов --- */}
          <Field>
            <FieldLabel htmlFor="setting-label">Название (label)</FieldLabel>
            <Input
              id="setting-label"
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="setting-placeholder">
              Подсказка внутри (placeholder)
            </FieldLabel>
            <Input
              id="setting-placeholder"
              value={field.placeholder ?? ""}
              onChange={(e) =>
                onChange({ ...field, placeholder: e.target.value || undefined })
              }
            />
          </Field>

          <Field orientation="horizontal">
            <Switch
              id="setting-required"
              checked={field.required}
              onCheckedChange={(required) => onChange({ ...field, required })}
            />
            <FieldLabel htmlFor="setting-required">
              Обязательное поле
            </FieldLabel>
          </Field>

          {/* --- text и textarea: длина текста --- */}
          {(field.type === "text" || field.type === "textarea") && (
            <div className="grid grid-cols-2 gap-3">
              <NumberSetting
                id="setting-min-length"
                label="Мин. длина"
                value={field.minLength}
                onChange={(minLength) => onChange({ ...field, minLength })}
              />
              <NumberSetting
                id="setting-max-length"
                label="Макс. длина"
                value={field.maxLength}
                onChange={(maxLength) => onChange({ ...field, maxLength })}
              />
            </div>
          )}

          {/* --- только textarea: высота --- */}
          {field.type === "textarea" && (
            <NumberSetting
              id="setting-rows"
              label="Высота в строках (rows)"
              value={field.rows}
              onChange={(rows) => onChange({ ...field, rows })}
            />
          )}

          {/* --- только number: границы и шаг --- */}
          {field.type === "number" && (
            <div className="grid grid-cols-3 gap-3">
              <NumberSetting
                id="setting-min"
                label="Минимум"
                value={field.min}
                onChange={(min) => onChange({ ...field, min })}
              />
              <NumberSetting
                id="setting-max"
                label="Максимум"
                value={field.max}
                onChange={(max) => onChange({ ...field, max })}
              />
              <NumberSetting
                id="setting-step"
                label="Шаг"
                value={field.step}
                onChange={(step) => onChange({ ...field, step })}
              />
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

// Числовая настройка. Пустое поле = undefined = "ограничения нет"
function NumberSetting(props: {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={props.id}>{props.label}</FieldLabel>
      <Input
        id={props.id}
        type="number"
        value={props.value ?? ""}
        onChange={(e) =>
          props.onChange(
            e.target.value === "" ? undefined : Number(e.target.value),
          )
        }
      />
    </Field>
  );
}

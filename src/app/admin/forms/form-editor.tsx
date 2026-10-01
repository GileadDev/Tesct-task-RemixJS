"use client";

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormFieldView } from "@/components/form-field-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  FIELD_TYPE_LABELS,
  createField,
  formInputSchema,
  type FieldType,
  type FormDTO,
  type FormField,
  type FormInput,
} from "@/lib/forms/schema";
import { cn } from "@/lib/utils";
import { FieldSettings } from "./field-settings";

type Props = {
  // Нет initialForm — создаём новую форму, есть — редактируем
  initialForm?: FormDTO;
};

const FIELD_TYPES: FieldType[] = ["text", "number", "textarea"];

export function FormEditor({ initialForm }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormInput>(() => ({
    title: initialForm?.title ?? "",
    description: initialForm?.description ?? "",
    published: initialForm?.published ?? false,
    fields: initialForm?.fields ?? [],
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const selectedField = form.fields.find((f) => f.id === selectedId) ?? null;

  // ---------- Действия с полями ----------

  function setFields(fields: FormField[]) {
    setForm((prev) => ({ ...prev, fields }));
  }

  function addField(type: FieldType) {
    const field = createField(type);
    setFields([...form.fields, field]);
    setSelectedId(field.id); // сразу открываем настройки нового поля
  }

  function updateField(updated: FormField) {
    setFields(form.fields.map((f) => (f.id === updated.id ? updated : f)));
  }

  function removeField(id: string) {
    setFields(form.fields.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.fields.length) return;
    const fields = [...form.fields];
    [fields[index], fields[target]] = [fields[target], fields[index]];
    setFields(fields);
  }

  // ---------- Сохранение ----------

  async function save() {
    // 1. Проверяем той же схемой, что и сервер: ошибки видны сразу
    const parsed = formInputSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(
        parsed.error.issues.map((issue) => describeIssue(issue, form.fields)),
      );
      return;
    }
    setErrors([]);
    setSaving(true);

    // 2. Новая форма — POST, существующая — PUT
    const response = await fetch(
      initialForm ? `/api/forms/${initialForm.id}` : "/api/forms",
      {
        method: initialForm ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    setSaving(false);

    if (response.status === 401) {
      router.push("/login");
      return;
    }
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setErrors([data?.error ?? "Не удалось сохранить форму"]);
      return;
    }

    const saved: FormDTO = await response.json();
    toast.add({ title: "Форма сохранена", type: "success" });

    // 3. После создания переходим на адрес редактирования этой формы
    if (!initialForm) {
      router.replace(`/admin/forms/${saved.id}`);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* ================= Левая колонка: панель + превью ================= */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {FIELD_TYPES.map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => addField(type)}
            >
              <PlusIcon />
              {FIELD_TYPE_LABELS[type]}
            </Button>
          ))}

          <div className="ml-auto flex items-center gap-4">
            <Field orientation="horizontal" className="w-auto">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(published) =>
                  setForm((prev) => ({ ...prev, published }))
                }
              />
              <FieldLabel htmlFor="published">Опубликована</FieldLabel>
            </Field>
            <Button onClick={save} disabled={saving}>
              {saving ? "Сохраняем..." : "Сохранить"}
            </Button>
          </div>
        </div>

        {errors.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <ul className="list-disc space-y-1 pl-4">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Превью: так форму увидит пользователь */}
        <Card>
          <CardHeader className="gap-2">
            <Input
              aria-label="Название формы"
              placeholder="Название формы"
              className="h-10 text-lg font-semibold"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Textarea
              aria-label="Описание формы"
              placeholder="Описание (необязательно)"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </CardHeader>

          <CardContent className="space-y-3">
            {form.fields.length === 0 && (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Полей пока нет. Добавьте первое кнопками сверху.
              </p>
            )}

            {form.fields.map((field, index) => (
              <div
                key={field.id}
                role="button"
                tabIndex={0}
                aria-label={`Настроить поле «${field.label}»`}
                onClick={() => setSelectedId(field.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(field.id);
                  }
                }}
                className={cn(
                  "relative cursor-pointer rounded-lg border p-3 pr-28 transition-colors outline-none hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                  selectedId === field.id && "border-primary bg-primary/5",
                )}
              >
                {/* pointer-events-none: клик проходит сквозь инпут на карточку */}
                <div className="pointer-events-none">
                  <FormFieldView field={field} preview />
                </div>

                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Выше"
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, -1);
                    }}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ниже"
                    disabled={index === form.fields.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, 1);
                    }}
                  >
                    <ArrowDownIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Удалить поле"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ================= Правая колонка: сайдбар ================= */}
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        {selectedField ? (
          <FieldSettings
            field={selectedField}
            onChange={updateField}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Кликните по полю в превью, чтобы открыть его настройки.
          </p>
        )}
      </aside>
    </div>
  );
}

// Ошибка Zod -> текст: "Поле «Телефон»: Минимум больше максимума"
function describeIssue(
  issue: { path: PropertyKey[]; message: string },
  fields: FormField[],
) {
  const [first, index] = issue.path;
  if (first === "fields" && typeof index === "number") {
    const label = fields[index]?.label || `№${index + 1}`;
    return `Поле «${label}»: ${issue.message}`;
  }
  return issue.message;
}

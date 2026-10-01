"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FormFieldView } from "@/components/form-field-view";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import {
  buildFillSchema,
  emptyValues,
  type FillValues,
} from "@/lib/forms/build-fill-schema";
import type { FormDTO } from "@/lib/forms/schema";

export function FillForm({ form }: { form: FormDTO }) {
  // Схему строим один раз, а не на каждую перерисовку
  const schema = useMemo(() => buildFillSchema(form.fields), [form.fields]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FillValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(form.fields),
  });

  // Данные, которые показываем в модалке. null — модалка закрыта
  const [submitted, setSubmitted] = useState<FillValues | null>(null);

  function confirm() {
    toast.add({ title: "Спасибо! Ответ отправлен", type: "success" });
    setSubmitted(null);
    reset();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{form.title}</CardTitle>
          {form.description && (
            <CardDescription className="whitespace-pre-line">
              {form.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {form.fields.length === 0 ? (
            <p className="text-muted-foreground">
              В этой форме пока нет полей.
            </p>
          ) : (
            // handleSubmit вызовет setSubmitted только если Zod не нашёл ошибок
            <form onSubmit={handleSubmit(setSubmitted)} noValidate>
              <FieldGroup>
                {form.fields.map((field) => (
                  <FormFieldView
                    key={field.id}
                    field={field}
                    inputProps={register(field.id)}
                    error={errors[field.id]?.message}
                  />
                ))}
                <Button type="submit">Отправить</Button>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={submitted !== null}
        onOpenChange={(open) => {
          if (!open) setSubmitted(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Проверьте данные</DialogTitle>
            <DialogDescription>
              Всё верно? Нажмите «Подтвердить», чтобы отправить ответ.
            </DialogDescription>
          </DialogHeader>

          <dl className="grid gap-3">
            {form.fields.map((field) => (
              <div key={field.id}>
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="wrap-break-words font-medium whitespace-pre-wrap">
                  {submitted?.[field.id]?.trim() || "—"}
                </dd>
              </div>
            ))}
          </dl>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Исправить
            </DialogClose>
            <Button onClick={confirm}>Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { SendIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { FormField } from "@/lib/forms/schema";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; text: string };

type Props = {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
};

export function AiChat({ fields, onFieldsChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function send() {
    const message = input.trim();
    if (!message || pending) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, fields }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Ошибка AI");

      onFieldsChange(data.fields); // поля в редакторе обновятся сразу
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Ошибка AI";
      setMessages((prev) => [...prev, { role: "assistant", text }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-помощник</CardTitle>
        <CardDescription>
          Например: «Добавь обязательное поле для телефона»
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length > 0 && (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {messages.map((m, i) => (
              <p
                key={i}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-6 bg-primary text-primary-foreground"
                    : "mr-6 bg-muted",
                )}
              >
                {m.text}
              </p>
            ))}
            {pending && (
              <p className="mr-6 animate-pulse rounded-lg bg-muted px-3 py-2 text-sm">
                Думаю...
              </p>
            )}
          </div>
        )}

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Textarea
            aria-label="Сообщение для AI"
            placeholder="Что сделать с формой?"
            className="min-h-10"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter — отправить, Shift+Enter — новая строка
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={pending || !input.trim()}
            aria-label="Отправить"
          >
            <SendIcon />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

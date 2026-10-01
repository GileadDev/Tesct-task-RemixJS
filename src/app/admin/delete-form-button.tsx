"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

type Props = { id: string; title: string };

export function DeleteFormButton({ id, title }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const response = await fetch(`/api/forms/${id}`, { method: "DELETE" });
    setPending(false);

    if (!response.ok) {
      toast.add({ title: "Не удалось удалить форму", type: "error" });
      return;
    }

    setOpen(false);
    toast.add({ title: "Форма удалена", type: "success" });
    router.refresh(); // перезапросить список форм с сервера
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Удалить
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить форму?</DialogTitle>
          <DialogDescription>
            Форма «{title}» будет удалена без возможности восстановления.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Отмена
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Удаляем..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

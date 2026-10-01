import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { verifySession } from "@/lib/dal";
import { listForms } from "@/lib/forms/queries";
import { DeleteFormButton } from "./delete-form-button";

export default async function AdminPage() {
  await verifySession();
  const forms = await listForms();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Формы</h1>
        <Link href="/admin/forms/new" className={buttonVariants()}>
          Создать форму
        </Link>
      </div>

      {forms.length === 0 ? (
        <p className="text-muted-foreground">Форм пока нет. Создайте первую.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Полей</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Изменена</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.title}</TableCell>
                <TableCell>{form.fields.length}</TableCell>
                <TableCell>
                  {form.published ? "Опубликована" : "Черновик"}
                </TableCell>
                <TableCell>
                  {new Date(form.updatedAt).toLocaleString("ru-RU")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {form.published && (
                      <Link
                        href={`/forms/${form.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                        })}
                      >
                        Открыть
                      </Link>
                    )}
                    <Link
                      href={`/admin/forms/${form.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Редактировать
                    </Link>
                    <DeleteFormButton id={form.id} title={form.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listForms } from "@/lib/forms/queries";

// Читать БД на каждый запрос, а не один раз при сборке
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const forms = await listForms({ publishedOnly: true });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Формы</h1>
        <Link
          href="/admin"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Админка
        </Link>
      </div>

      {forms.length === 0 ? (
        <p className="text-muted-foreground">Пока нет опубликованных форм.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {forms.map((form) => (
            <li key={form.id}>
              <Link
                href={`/forms/${form.id}`}
                className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{form.title}</CardTitle>
                    {form.description && (
                      <CardDescription className="line-clamp-2">
                        {form.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Полей: {form.fields.length}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

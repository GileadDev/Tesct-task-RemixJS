import Link from "next/link";
import { notFound } from "next/navigation";
import { getForm } from "@/lib/forms/queries";
import { FillForm } from "./fill-form";

export default async function FormPage({ params }: PageProps<"/forms/[id]">) {
  const { id } = await params;

  // Черновики снаружи не видны: publishedOnly
  const form = await getForm(id, { publishedOnly: true });
  if (!form) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Все формы
      </Link>
      <FillForm form={form} />
    </main>
  );
}

import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getForm } from "@/lib/forms/queries";
import { FormEditor } from "../form-editor";

export default async function EditFormPage({
  params,
}: PageProps<"/admin/forms/[id]">) {
  await verifySession();

  const { id } = await params;
  const form = await getForm(id);
  if (!form) notFound(); // покажет стандартную страницу 404

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Редактирование формы</h1>
      <FormEditor initialForm={form} />
    </div>
  );
}

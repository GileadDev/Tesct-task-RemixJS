import { verifySession } from "@/lib/dal";
import { FormEditor } from "../form-editor";

export default async function NewFormPage() {
  await verifySession();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Новая форма</h1>
      <FormEditor />
    </div>
  );
}

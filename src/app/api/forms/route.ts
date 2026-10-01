import { readJson, unauthorized, validationError } from "@/lib/api";
import { getSession } from "@/lib/dal";
import { createForm, listForms } from "@/lib/forms/queries";
import { formInputSchema } from "@/lib/forms/schema";

// GET /api/forms — список всех форм (для админа)
export async function GET() {
  if (!(await getSession())) return unauthorized();

  const forms = await listForms();
  return Response.json(forms);
}

// POST /api/forms — создать форму
export async function POST(request: Request) {
  if (!(await getSession())) return unauthorized();

  const parsed = formInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  const form = await createForm(parsed.data);
  return Response.json(form, { status: 201 });
}

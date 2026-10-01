import { notFound, readJson, unauthorized, validationError } from "@/lib/api";
import { getSession } from "@/lib/dal";
import { deleteForm, getForm, updateForm } from "@/lib/forms/queries";
import { formInputSchema } from "@/lib/forms/schema";

// RouteContext<"/api/forms/[id]"> — тип, который Next.js генерирует сам:
// в нём params = Promise<{ id: string }>

// GET /api/forms/:id — одна форма
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/forms/[id]">,
) {
  if (!(await getSession())) return unauthorized();

  const { id } = await ctx.params;
  const form = await getForm(id);
  if (!form) return notFound();

  return Response.json(form);
}

// PUT /api/forms/:id — сохранить форму целиком
export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/forms/[id]">,
) {
  if (!(await getSession())) return unauthorized();

  const parsed = formInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  const { id } = await ctx.params;
  const form = await updateForm(id, parsed.data);
  if (!form) return notFound();

  return Response.json(form);
}

// DELETE /api/forms/:id — удалить форму
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/forms/[id]">,
) {
  if (!(await getSession())) return unauthorized();

  const { id } = await ctx.params;
  const deleted = await deleteForm(id);
  if (!deleted) return notFound();

  return new Response(null, { status: 204 });
}

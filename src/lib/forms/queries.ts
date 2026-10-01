import "server-only";
import mongoose, { type Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Form, type FormDoc } from "@/models/Form";
import { fieldSchema, type FormDTO, type FormInput } from "./schema";

type FormFromDB = FormDoc & { _id: Types.ObjectId };

// Превращаем документ MongoDB в простой объект для страниц и API (DTO)
function toDTO(doc: FormFromDB): FormDTO {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    published: doc.published,
    // Zod убирает лишние ключи и заодно проверяет, что данные в БД в порядке
    fields: fieldSchema.array().parse(doc.fields.map(removeNulls)),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// Mongoose может вернуть null в пустых настройках, а Zod ждёт undefined
function removeNulls(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null),
  );
}

type Options = { publishedOnly?: boolean };

export async function listForms({ publishedOnly = false }: Options = {}) {
  await connectDB();
  const filter = publishedOnly ? { published: true } : {};
  const docs = await Form.find(filter).sort({ updatedAt: -1 }).lean();
  return docs.map(toDTO);
}

export async function getForm(
  id: string,
  { publishedOnly = false }: Options = {},
) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const filter = publishedOnly ? { _id: id, published: true } : { _id: id };
  const doc = await Form.findOne(filter).lean();
  return doc ? toDTO(doc) : null;
}

export async function createForm(input: FormInput) {
  await connectDB();
  const doc = await Form.create(input);
  return toDTO(doc.toObject());
}

export async function updateForm(id: string, input: FormInput) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Form.findByIdAndUpdate(id, input, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
  return doc ? toDTO(doc) : null;
}

export async function deleteForm(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  const doc = await Form.findByIdAndDelete(id);
  return doc !== null;
}

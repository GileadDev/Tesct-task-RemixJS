import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const fieldSchema = new Schema(
  {
    id: { type: String, required: true },
    // Ключ называется "type", поэтому описываем его объектом { type: String }
    type: {
      type: String,
      enum: ["text", "number", "textarea"],
      required: true,
    },
    label: { type: String, required: true },
    placeholder: String,
    required: { type: Boolean, default: false },
    minLength: Number,
    maxLength: Number,
    rows: Number,
    min: Number,
    max: Number,
    step: Number,
  },
  { _id: false },
);

const formSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    published: { type: Boolean, default: false, index: true },
    fields: { type: [fieldSchema], default: [] },
  },
  { timestamps: true },
);

export type FormDoc = InferSchemaType<typeof formSchema>;

export const Form =
  (mongoose.models.Form as Model<FormDoc> | undefined) ??
  mongoose.model<FormDoc>("Form", formSchema);

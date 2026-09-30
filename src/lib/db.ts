import "server-only";
import mongoose from "mongoose";

// Next.js в режиме разработки перезапускает модули при каждом сохранении файла.
// Храним подключение в globalThis, чтобы не открывать новое соединение каждый раз.
const globalForMongoose = globalThis as unknown as {
  mongoosePromise?: Promise<typeof mongoose>;
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI не задан. Проверьте файл .env.local");
  }

  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    return await globalForMongoose.mongoosePromise;
  } catch (error) {
    // Подключение не удалось: сбрасываем промис, чтобы следующий запрос попробовал снова.
    globalForMongoose.mongoosePromise = undefined;
    throw error;
  }
}

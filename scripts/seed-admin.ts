import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";

async function main() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Заполните MONGODB_URI, ADMIN_EMAIL и ADMIN_PASSWORD в .env.local",
    );
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD должен быть не короче 8 символов");
  }

  await mongoose.connect(MONGODB_URI);

  // 10 = "cost": во сколько раундов считается хеш. Стандартное значение.
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // upsert: если админ с таким email есть — обновить пароль, если нет — создать
  await User.updateOne(
    { email: ADMIN_EMAIL.toLowerCase() },
    { $set: { passwordHash } },
    { upsert: true },
  );

  console.log(`Готово: админ ${ADMIN_EMAIL} создан или обновлён`);
}

main()
  .catch((error) => {
    console.error("Ошибка:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

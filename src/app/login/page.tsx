import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Вход — Form Builder" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Все формы
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}

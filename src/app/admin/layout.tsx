import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { LogoutButton } from "./logout-button";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await verifySession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="font-semibold">
            Form Builder · админка
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-4">{children}</main>
    </div>
  );
}

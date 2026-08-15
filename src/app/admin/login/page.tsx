import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { tryAdminLogin } from "./session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin login" };

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const ok = await tryAdminLogin(password);
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <header className="max-w-xl">
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Admin login</h1>
        <p className="mt-2 text-sand-300">Password matches the ADMIN_PASSWORD env var.</p>
      </header>
      <form action={login} method="post" className="grid max-w-xl gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-mono text-[10px] stencil text-sand-500">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="border border-sand-500/20 bg-ink-900 px-3 py-2"
          />
        </label>
        <button type="submit" className="bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
          Sign in
        </button>
        {error ? <p className="text-sm text-sand-300">Wrong password.</p> : null}
      </form>
    </div>
  );
}

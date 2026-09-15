"use server";

import { redirect } from "next/navigation";
import { verifyAdminLogin } from "@/lib/repo/admin";
import { signAdminToken, setAdminSessionCookie, clearAdminSessionCookie } from "@/lib/auth";

export type LoginState = { ok: boolean; message?: string };

export async function loginAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { ok: false, message: "Vui lòng nhập email và mật khẩu." };

  const user = verifyAdminLogin(email, password);
  if (!user) return { ok: false, message: "Email hoặc mật khẩu không đúng." };

  const token = signAdminToken({ sub: user.id, email: user.email, name: user.name, role: user.role });
  await setAdminSessionCookie(token);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "@/app/actions/admin-auth";

const initialState: LoginState = { ok: false };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm bg-white p-8">
        <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-2 text-center">TomQ Bridal</p>
        <h1 className="font-heading text-2xl text-center mb-8 text-neutral-900">Đăng nhập quản trị</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-500 block mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-500 block mb-2">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>
          {state.message && <p className="text-sm text-red-600">{state.message}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-neutral-900 text-white py-3 text-sm tracking-widest uppercase disabled:opacity-60"
          >
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

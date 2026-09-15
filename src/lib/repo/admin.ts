import { getDb, newId } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function findAdminByEmail(email: string) {
  const db = getDb();
  return db.prepare(`SELECT * FROM admin_users WHERE email = ?`).get(email) as
    | (Record<string, unknown> & { password_hash: string })
    | undefined;
}

export function verifyAdminLogin(email: string, password: string): AdminUser | null {
  const row = findAdminByEmail(email);
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return { id: row.id as string, name: row.name as string, email: row.email as string, role: row.role as string };
}

export function createAdminUser(data: { name: string; email: string; password: string; role?: string }) {
  const db = getDb();
  const id = newId("admin");
  db.prepare(
    `INSERT INTO admin_users (id, name, email, password_hash, role) VALUES (?,?,?,?,?)`
  ).run(id, data.name, data.email, hashPassword(data.password), data.role ?? "admin");
  return id;
}

export function ensureDefaultAdmin() {
  const email = process.env.ADMIN_DEFAULT_EMAIL || "owner@tomqbridal.com";
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "ChangeMe123!";
  const existing = findAdminByEmail(email);
  if (!existing) {
    createAdminUser({ name: "Quản trị viên", email, password, role: "admin" });
    return true;
  }
  return false;
}

export function listAdminUsers(): AdminUser[] {
  const db = getDb();
  const rows = db.prepare(`SELECT id, name, email, role FROM admin_users ORDER BY name ASC`).all() as AdminUser[];
  return rows;
}

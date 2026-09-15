import { getDb, newId, nowIso } from "@/lib/db";
import type { Customer, Appointment } from "@/lib/types";

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? null,
    phone: row.phone as string,
    address: (row.address as string) ?? null,
    note: (row.note as string) ?? null,
    source: row.source as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Tìm hoặc tạo khách hàng theo số điện thoại (dùng chung cho đặt lịch / mua hàng / thử đồ)
export function findOrCreateCustomer(data: {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  source?: string;
}): Customer {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM customers WHERE phone = ?`).get(data.phone) as
    | Record<string, unknown>
    | undefined;
  if (existing) {
    db.prepare(
      `UPDATE customers SET name=?, email=COALESCE(?, email), address=COALESCE(?, address), updated_at=? WHERE id=?`
    ).run(data.name, data.email ?? null, data.address ?? null, nowIso(), existing.id as string);
    return mapCustomer(
      db.prepare(`SELECT * FROM customers WHERE id=?`).get(existing.id as string)!
    );
  }
  const id = newId("cus");
  db.prepare(
    `INSERT INTO customers (id, name, email, phone, address, source) VALUES (?,?,?,?,?,?)`
  ).run(id, data.name, data.email ?? null, data.phone, data.address ?? null, data.source ?? "website");
  return mapCustomer(db.prepare(`SELECT * FROM customers WHERE id=?`).get(id)!);
}

export function listCustomers(opts: { search?: string; limit?: number; offset?: number } = {}) {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (opts.search) {
    clauses.push(`(name LIKE ? OR phone LIKE ? OR email LIKE ?)`);
    params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = (
    db.prepare(`SELECT COUNT(*) as cnt FROM customers ${where}`).get(...params) as {
      cnt: number;
    }
  ).cnt;
  let sql = `SELECT * FROM customers ${where} ORDER BY created_at DESC`;
  if (opts.limit) {
    sql += ` LIMIT ${Number(opts.limit)} OFFSET ${Number(opts.offset ?? 0)}`;
  }
  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  return { items: rows.map(mapCustomer), total };
}

export function getCustomerById(id: string): Customer | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM customers WHERE id=?`).get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapCustomer(row) : null;
}

export function updateCustomerNote(id: string, note: string) {
  getDb().prepare(`UPDATE customers SET note=?, updated_at=? WHERE id=?`).run(note, nowIso(), id);
}

// ---------- Contact messages ----------
export function createContactMessage(data: {
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  customerId?: string | null;
}) {
  const db = getDb();
  const id = newId("msg");
  db.prepare(
    `INSERT INTO contact_messages (id, customer_id, name, email, phone, subject, message)
     VALUES (?,?,?,?,?,?,?)`
  ).run(id, data.customerId ?? null, data.name, data.email ?? null, data.phone ?? null, data.subject ?? null, data.message);
  return id;
}

export function listContactMessages(opts: { limit?: number; offset?: number } = {}) {
  const db = getDb();
  const total = (db.prepare(`SELECT COUNT(*) as cnt FROM contact_messages`).get() as { cnt: number }).cnt;
  let sql = `SELECT * FROM contact_messages ORDER BY created_at DESC`;
  if (opts.limit) sql += ` LIMIT ${Number(opts.limit)} OFFSET ${Number(opts.offset ?? 0)}`;
  const rows = db.prepare(sql).all() as Record<string, unknown>[];
  return {
    items: rows.map((r) => ({
      id: r.id as string,
      customerId: (r.customer_id as string) ?? null,
      name: r.name as string,
      email: (r.email as string) ?? null,
      phone: (r.phone as string) ?? null,
      subject: (r.subject as string) ?? null,
      message: r.message as string,
      isRead: r.is_read === 1,
      createdAt: r.created_at as string,
    })),
    total,
  };
}

export function markContactMessageRead(id: string) {
  getDb().prepare(`UPDATE contact_messages SET is_read=1 WHERE id=?`).run(id);
}

// ---------- Appointments ----------
function mapAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    customerId: (row.customer_id as string) ?? null,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    preferredDate: row.preferred_date as string,
    preferredTime: row.preferred_time as string,
    appointmentType: row.appointment_type as string,
    message: (row.message as string) ?? null,
    status: row.status as Appointment["status"],
    depositRequired: row.deposit_required as number,
    depositPaid: row.deposit_paid === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function createAppointment(data: {
  name: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  appointmentType?: string;
  message?: string;
  depositRequired?: number;
}): Appointment {
  const db = getDb();
  const customer = findOrCreateCustomer({
    name: data.name,
    phone: data.phone,
    email: data.email,
    source: "appointment",
  });
  const id = newId("apt");
  db.prepare(
    `INSERT INTO appointments (id, customer_id, name, phone, email, preferred_date, preferred_time, appointment_type, message, deposit_required)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    customer.id,
    data.name,
    data.phone,
    data.email ?? null,
    data.preferredDate,
    data.preferredTime,
    data.appointmentType ?? "fitting",
    data.message ?? null,
    data.depositRequired ?? 0
  );
  return mapAppointment(db.prepare(`SELECT * FROM appointments WHERE id=?`).get(id)!);
}

export function listAppointments(
  opts: { status?: string; customerId?: string; limit?: number; offset?: number } = {}
) {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (opts.status) {
    clauses.push(`status = ?`);
    params.push(opts.status);
  }
  if (opts.customerId) {
    clauses.push(`customer_id = ?`);
    params.push(opts.customerId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = (
    db.prepare(`SELECT COUNT(*) as cnt FROM appointments ${where}`).get(...params) as {
      cnt: number;
    }
  ).cnt;
  let sql = `SELECT * FROM appointments ${where} ORDER BY created_at DESC`;
  if (opts.limit) sql += ` LIMIT ${Number(opts.limit)} OFFSET ${Number(opts.offset ?? 0)}`;
  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  return { items: rows.map(mapAppointment), total };
}

export function updateAppointmentStatus(id: string, status: Appointment["status"], depositPaid?: boolean) {
  const db = getDb();
  if (depositPaid !== undefined) {
    db.prepare(`UPDATE appointments SET status=?, deposit_paid=?, updated_at=? WHERE id=?`).run(
      status,
      depositPaid ? 1 : 0,
      nowIso(),
      id
    );
  } else {
    db.prepare(`UPDATE appointments SET status=?, updated_at=? WHERE id=?`).run(status, nowIso(), id);
  }
}

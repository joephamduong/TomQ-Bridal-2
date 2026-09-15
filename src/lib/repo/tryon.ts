import { getDb, newId, nowIso } from "@/lib/db";
import type { TryOnRequest, TryOnStatus } from "@/lib/types";
import { findOrCreateCustomer } from "@/lib/repo/customer";

function mapTryOn(row: Record<string, unknown>): TryOnRequest {
  return {
    id: row.id as string,
    requestCode: row.request_code as string,
    customerId: (row.customer_id as string) ?? null,
    productId: row.product_id as string,
    productName: (row.product_name as string) ?? undefined,
    fullName: row.full_name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    selectedStyle: (row.selected_style as string) ?? null,
    selectedMaterial: (row.selected_material as string) ?? null,
    selectedColor: (row.selected_color as string) ?? null,
    customerPhotoUrl: row.customer_photo_url as string,
    resultImageUrl: (row.result_image_url as string) ?? null,
    fee: row.fee as number,
    paymentProofUrl: (row.payment_proof_url as string) ?? null,
    paymentConfirmedAt: (row.payment_confirmed_at as string) ?? null,
    status: row.status as TryOnStatus,
    aiProvider: (row.ai_provider as string) ?? null,
    aiError: (row.ai_error as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function generateRequestCode(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TO${y}${m}${day}-${rand}`;
}

export function createTryOnRequest(data: {
  productId: string;
  fullName: string;
  phone: string;
  email?: string;
  selectedStyle?: string;
  selectedMaterial?: string;
  selectedColor?: string;
  customerPhotoUrl: string;
  fee: number;
}): TryOnRequest {
  const db = getDb();
  const customer = findOrCreateCustomer({
    name: data.fullName,
    phone: data.phone,
    email: data.email,
    source: "tryon",
  });
  const id = newId("tryon");
  const code = generateRequestCode();
  db.prepare(
    `INSERT INTO tryon_requests (id, request_code, customer_id, product_id, full_name, phone, email, selected_style, selected_material, selected_color, customer_photo_url, fee)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    code,
    customer.id,
    data.productId,
    data.fullName,
    data.phone,
    data.email ?? null,
    data.selectedStyle ?? null,
    data.selectedMaterial ?? null,
    data.selectedColor ?? null,
    data.customerPhotoUrl,
    data.fee
  );
  return getTryOnById(id)!;
}

export function getTryOnById(id: string): TryOnRequest | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT t.*, p.name as product_name FROM tryon_requests t JOIN products p ON p.id = t.product_id WHERE t.id=?`
    )
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapTryOn(row) : null;
}

export function getTryOnByCodeAndPhone(code: string, phone: string): TryOnRequest | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT t.*, p.name as product_name FROM tryon_requests t JOIN products p ON p.id = t.product_id WHERE t.request_code=? AND t.phone=?`
    )
    .get(code, phone) as Record<string, unknown> | undefined;
  return row ? mapTryOn(row) : null;
}

export function listTryOnRequests(
  opts: { status?: TryOnStatus; customerId?: string; limit?: number; offset?: number } = {}
) {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (opts.status) {
    clauses.push(`t.status = ?`);
    params.push(opts.status);
  }
  if (opts.customerId) {
    clauses.push(`t.customer_id = ?`);
    params.push(opts.customerId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = (
    db.prepare(`SELECT COUNT(*) as cnt FROM tryon_requests t ${where}`).get(...params) as {
      cnt: number;
    }
  ).cnt;
  let sql = `SELECT t.*, p.name as product_name FROM tryon_requests t JOIN products p ON p.id = t.product_id ${where} ORDER BY t.created_at DESC`;
  if (opts.limit) sql += ` LIMIT ${Number(opts.limit)} OFFSET ${Number(opts.offset ?? 0)}`;
  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  return { items: rows.map(mapTryOn), total };
}

export function setTryOnPaymentProof(id: string, url: string) {
  getDb()
    .prepare(`UPDATE tryon_requests SET payment_proof_url=?, updated_at=? WHERE id=?`)
    .run(url, nowIso(), id);
}

export function updateTryOnStatus(id: string, status: TryOnStatus) {
  const db = getDb();
  const now = nowIso();
  if (status === "PAYMENT_CONFIRMED") {
    db.prepare(`UPDATE tryon_requests SET status=?, payment_confirmed_at=?, updated_at=? WHERE id=?`).run(
      status,
      now,
      now,
      id
    );
  } else {
    db.prepare(`UPDATE tryon_requests SET status=?, updated_at=? WHERE id=?`).run(status, now, id);
  }
}

export function setTryOnResult(id: string, resultImageUrl: string, aiProvider: string) {
  getDb()
    .prepare(
      `UPDATE tryon_requests SET status='COMPLETED', result_image_url=?, ai_provider=?, ai_error=NULL, updated_at=? WHERE id=?`
    )
    .run(resultImageUrl, aiProvider, nowIso(), id);
}

export function setTryOnError(id: string, error: string) {
  getDb()
    .prepare(`UPDATE tryon_requests SET status='FAILED', ai_error=?, updated_at=? WHERE id=?`)
    .run(error, nowIso(), id);
}

import { getDb, newId, nowIso } from "@/lib/db";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { findOrCreateCustomer } from "@/lib/repo/customer";

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    orderCode: row.order_code as string,
    customerId: (row.customer_id as string) ?? null,
    fullName: row.full_name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    shippingAddress: row.shipping_address as string,
    shippingCity: (row.shipping_city as string) ?? null,
    note: (row.note as string) ?? null,
    subtotal: row.subtotal as number,
    shippingFee: row.shipping_fee as number,
    total: row.total as number,
    status: row.status as OrderStatus,
    paymentMethod: row.payment_method as string,
    paymentProofUrl: (row.payment_proof_url as string) ?? null,
    paymentConfirmedAt: (row.payment_confirmed_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapItem(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    productName: row.product_name as string,
    variantLabel: (row.variant_label as string) ?? null,
    unitPrice: row.unit_price as number,
    quantity: row.quantity as number,
    lineTotal: row.line_total as number,
  };
}

function generateOrderCode(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BA${y}${m}${day}-${rand}`;
}

export function createOrder(data: {
  fullName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  shippingCity?: string;
  note?: string;
  shippingFee: number;
  items: {
    productId: string;
    productName: string;
    variantLabel?: string;
    unitPrice: number;
    quantity: number;
  }[];
}): Order {
  const db = getDb();
  const customer = findOrCreateCustomer({
    name: data.fullName,
    phone: data.phone,
    email: data.email,
    address: data.shippingAddress,
    source: "order",
  });
  const subtotal = data.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const total = subtotal + data.shippingFee;
  const id = newId("ord");
  const orderCode = generateOrderCode();
  db.prepare(
    `INSERT INTO orders (id, order_code, customer_id, full_name, phone, email, shipping_address, shipping_city, note, subtotal, shipping_fee, total)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    orderCode,
    customer.id,
    data.fullName,
    data.phone,
    data.email ?? null,
    data.shippingAddress,
    data.shippingCity ?? null,
    data.note ?? null,
    subtotal,
    data.shippingFee,
    total
  );
  const stmt = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, product_name, variant_label, unit_price, quantity, line_total)
     VALUES (?,?,?,?,?,?,?,?)`
  );
  data.items.forEach((it) => {
    stmt.run(
      newId("oi"),
      id,
      it.productId,
      it.productName,
      it.variantLabel ?? null,
      it.unitPrice,
      it.quantity,
      it.unitPrice * it.quantity
    );
  });
  return getOrderById(id)!;
}

export function getOrderById(id: string): Order | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM orders WHERE id=?`).get(id) as
    | Record<string, unknown>
    | undefined;
  if (!row) return null;
  const items = db.prepare(`SELECT * FROM order_items WHERE order_id=?`).all(id) as Record<
    string,
    unknown
  >[];
  return { ...mapOrder(row), items: items.map(mapItem) };
}

export function getOrderByCodeAndPhone(orderCode: string, phone: string): Order | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM orders WHERE order_code=? AND phone=?`).get(orderCode, phone) as
    | Record<string, unknown>
    | undefined;
  if (!row) return null;
  const items = db
    .prepare(`SELECT * FROM order_items WHERE order_id=?`)
    .all(row.id as string) as Record<string, unknown>[];
  return { ...mapOrder(row), items: items.map(mapItem) };
}

export function listOrders(
  opts: { status?: OrderStatus; search?: string; customerId?: string; limit?: number; offset?: number } = {}
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
  if (opts.search) {
    clauses.push(`(order_code LIKE ? OR full_name LIKE ? OR phone LIKE ?)`);
    params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = (
    db.prepare(`SELECT COUNT(*) as cnt FROM orders ${where}`).get(...params) as { cnt: number }
  ).cnt;
  let sql = `SELECT * FROM orders ${where} ORDER BY created_at DESC`;
  if (opts.limit) sql += ` LIMIT ${Number(opts.limit)} OFFSET ${Number(opts.offset ?? 0)}`;
  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  return { items: rows.map(mapOrder), total };
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const db = getDb();
  const now = nowIso();
  if (status === "PAYMENT_CONFIRMED") {
    db.prepare(`UPDATE orders SET status=?, payment_confirmed_at=?, updated_at=? WHERE id=?`).run(
      status,
      now,
      now,
      id
    );
  } else {
    db.prepare(`UPDATE orders SET status=?, updated_at=? WHERE id=?`).run(status, now, id);
  }
}

export function setOrderPaymentProof(id: string, url: string) {
  getDb()
    .prepare(`UPDATE orders SET payment_proof_url=?, updated_at=? WHERE id=?`)
    .run(url, nowIso(), id);
}

export function countOrdersByStatus() {
  const db = getDb();
  const rows = db
    .prepare(`SELECT status, COUNT(*) as cnt FROM orders GROUP BY status`)
    .all() as { status: string; cnt: number }[];
  return rows;
}

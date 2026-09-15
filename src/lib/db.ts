import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Dùng node:sqlite (built-in từ Node.js >= 22.5) thay vì Prisma/better-sqlite3:
// - Không cần tải binary engine qua mạng khi cài đặt (Prisma cần internet để tải query engine).
// - Không cần build native module (node-gyp) như better-sqlite3.
// => Chỉ cần cài Node.js trên hosting là chạy được ngay, rất phù hợp để "upload lên hosting và dùng".

const DATABASE_PATH = process.env.DATABASE_PATH || "./data/app.db";

declare global {
  var __bridalDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  const resolved = path.resolve(/*turbopackIgnore: true*/ process.cwd(), DATABASE_PATH);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const database = new DatabaseSync(resolved);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");

  const schemaPath = path.resolve(process.cwd(), "db/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  database.exec(schema);

  return database;
}

// Giữ 1 kết nối duy nhất xuyên suốt vòng đời tiến trình (kể cả khi Next.js hot-reload trong dev).
export function getDb(): DatabaseSync {
  if (!global.__bridalDb) {
    global.__bridalDb = createConnection();
  }
  return global.__bridalDb;
}

export function newId(prefix = ""): string {
  const raw = crypto.randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${raw}` : raw;
}

export function nowIso(): string {
  return new Date().toISOString();
}

// Chuyển 0/1 SQLite -> boolean JS
export function toBool(v: unknown): boolean {
  return v === 1 || v === true;
}
export function fromBool(v: boolean): number {
  return v ? 1 : 0;
}

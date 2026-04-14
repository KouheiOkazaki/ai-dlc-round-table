import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env" });
config({ path: ".env.local", override: true });

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | undefined;

// neon() はリクエスト時に初めて呼ばれるよう遅延初期化する
// これにより DB 接続なしのビルド時に "No database connection string" エラーが出なくなる
function getDb(): Db {
  if (_db) return _db;
  const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;
  _db = drizzle({ client: neon(url!), schema });
  return _db;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

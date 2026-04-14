import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { items, loans } from "../src/schema";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;
if (!url) throw new Error("DATABASE_URL / NETLIFY_DATABASE_URL が未設定です");

const db = drizzle({ client: neon(url) });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function seed() {
  console.log("🌱 シードデータを投入します...");

  // --- 既存データをクリア ---
  await db.delete(loans);
  await db.delete(items);
  console.log("  既存データを削除しました");

  // --- 備品マスタ ---
  const itemDefs = [
    { name: "プロジェクター（EPSON EB-W52）", description: "会議室A専用。HDMIケーブル付属", defaultLoanDays: 3 },
    { name: "ノートPC（ThinkPad X1 Carbon）", description: "開発用貸出PC。充電器同梱", defaultLoanDays: 7 },
    { name: "ポータブルWi-Fiルーター", description: "出張・外出時の通信用", defaultLoanDays: 5 },
    { name: "一眼レフカメラ（Canon EOS R50）", description: "広報撮影用。予備バッテリー2本付き", defaultLoanDays: 2 },
    { name: "外付けSSD 1TB（Samsung T7）", description: "大容量データ転送用", defaultLoanDays: 3 },
    { name: "Webカメラ（Logicool C920）", description: "リモート会議・録画用", defaultLoanDays: 7 },
    { name: "ホワイトボードマーカーセット", description: "会議室B備品。消し用クリーナー付き", defaultLoanDays: 1 },
    { name: "延長コード（3m・6口）", description: "イベント・展示会用", defaultLoanDays: 2 },
  ] as const;

  const inserted = await db
    .insert(items)
    .values(itemDefs.map((d) => ({ ...d, qrCode: "" })))
    .returning({ id: items.id });

  // qrCode を更新
  for (const { id } of inserted) {
    const { eq } = await import("drizzle-orm");
    await db
      .update(items)
      .set({ qrCode: `${APP_URL}/items/${id}/scan` })
      .where(eq(items.id, id));
  }
  console.log(`  備品 ${inserted.length} 件を登録しました`);

  // --- 貸出データ ---
  const now = new Date();
  const d = (offsetDays: number) =>
    new Date(now.getTime() + offsetDays * 86400000);

  const loanDefs = [
    // 貸出中（期限内）
    {
      itemIndex: 0, // プロジェクター
      borrowerName: "田中 一郎",
      loanedAt: d(-1),
      dueDate: d(2),
      returnedAt: null,
    },
    {
      itemIndex: 1, // ノートPC
      borrowerName: "鈴木 花子",
      loanedAt: d(-3),
      dueDate: d(4),
      returnedAt: null,
    },
    // 期限超過（返却未了）
    {
      itemIndex: 2, // Wi-Fiルーター
      borrowerName: "佐藤 次郎",
      loanedAt: d(-10),
      dueDate: d(-5),
      returnedAt: null,
    },
    // 返却済みの履歴
    {
      itemIndex: 3, // カメラ
      borrowerName: "山田 三郎",
      loanedAt: d(-14),
      dueDate: d(-12),
      returnedAt: d(-13),
    },
    {
      itemIndex: 4, // SSD
      borrowerName: "伊藤 四郎",
      loanedAt: d(-20),
      dueDate: d(-17),
      returnedAt: d(-18),
    },
    {
      itemIndex: 5, // Webカメラ
      borrowerName: "渡辺 五郎",
      loanedAt: d(-7),
      dueDate: d(0),
      returnedAt: d(-1),
    },
  ];

  await db.insert(loans).values(
    loanDefs.map(({ itemIndex, ...rest }) => ({
      itemId: inserted[itemIndex].id,
      ...rest,
    }))
  );
  console.log(`  貸出データ ${loanDefs.length} 件を登録しました`);

  console.log("✅ シード完了");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

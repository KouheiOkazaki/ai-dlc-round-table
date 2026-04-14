# Bolt: bolt-001

## 0. Bolt 目的
- **対象 Intent:** INT-001
- **対象 Unit:** INT-001_UNIT-002（QRコードスキャン + 貸出・返却操作）
- **対象ユーザーストーリー:** US-005, US-006
- **Goal (Definition of Done):**
  - `loans` テーブルが DB に作成されている
  - QRスキャンページ（`/scan`）でカメラが起動しQRコードを読み取れる
  - 貸出・返却操作ページ（`/items/[id]/scan`）で貸出・返却が記録できる

---

## 1. スコープ

### In Scope
- `loans` テーブルの Drizzle スキーマ追加（`src/schema.ts`）
- Drizzle マイグレーション生成（`npx drizzle-kit generate`）
- Server Actions: loanItem, returnItem（`app/actions/loans.ts`）
- ページ実装:
  - `/scan` — QRスキャンページ（Client Component、カメラ起動・QR読み取り）
  - `/items/[id]/scan` — 貸出・返却操作ページ（Server Component）
- ナビゲーション: トップページ（`/`）から `/scan` へのリンク追加
- ライブラリ追加: `@zxing/browser`, `@zxing/library`

### Out of Scope
- 貸出状況ダッシュボード・履歴（UNIT-003）
- 認証・権限管理

---

## 2. 依存関係・前提条件

### 依存関係
- UNIT-001: `items` テーブル、`/items/{id}/scan` URL 構造
- 既存: `src/schema.ts`（`items` テーブルが定義済み）
- 既存: `src/db.ts`（DB 接続）
- 新規ライブラリ: `@zxing/browser`, `@zxing/library`

### 前提条件（環境）
- Netlify DB（PostgreSQL）接続が `DATABASE_URL` または `NETLIFY_DATABASE_URL` で設定済み
- Next.js App Router 環境
- UNIT-001（items テーブル・備品CRUD画面）が実装済み

### 制約
- 既存の `items`, `comments` テーブルへの影響がないこと

---

## 3. デザイン差分（Design Diff）

### DB スキーマ追加（`src/schema.ts`）
```ts
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => items.id),
  borrowerName: text("borrower_name").notNull(),
  loanedAt: timestamp("loaned_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  dueDate: timestamp("due_date", { mode: "date", withTimezone: true }).notNull(),
  returnedAt: timestamp("returned_at", { mode: "date", withTimezone: true }),
});
```

### ページ構成（App Router）
```
app/
  scan/
    page.tsx              # QRスキャンページ（Client Component）
  items/
    [id]/
      scan/
        page.tsx          # 貸出・返却操作ページ（Server Component）
  actions/
    loans.ts              # Server Actions (loanItem, returnItem)
```

### Server Actions 仕様
- `loanItem(itemId: number, formData: FormData)`:
  - borrowerName, dueDate を FormData から取得
  - 既に貸出中（returnedAt IS NULL）の場合はエラーオブジェクトを返す
  - INSERT into loans → `/items/${itemId}/scan` へリダイレクト
- `returnItem(loanId: number)`:
  - loans.returnedAt を now() で UPDATE
  - getLoanById で itemId を取得 → `/items/${itemId}/scan` へリダイレクト

---

## 4. 実装 & テスト

### 対象ファイル（新規/変更）
| ファイル | 種別 | 説明 |
|---------|------|------|
| `src/schema.ts` | 変更 | `loans` テーブル追加 |
| `drizzle/migrations/` | 自動生成 | マイグレーションファイル |
| `app/actions/loans.ts` | 新規 | loanItem, returnItem Server Actions |
| `app/items/[id]/scan/page.tsx` | 新規 | 貸出・返却操作ページ |
| `app/scan/page.tsx` | 新規 | QRスキャンページ（Client Component） |
| `app/page.tsx` | 変更 | `/scan` へのナビゲーションリンク追加 |

### テスト観点
- 備品の貸出が正常に登録されること
- 既に貸出中の備品は二重貸出できないこと（エラー表示）
- 返却処理で returnedAt が設定されること
- QRスキャンページでカメラが起動すること
- QR読み取り成功で `/items/{id}/scan` に遷移すること

---

## 5. デプロイユニット

### 影響するデプロイ対象
- Netlify（Next.js App）: scan ページ、items/[id]/scan ページ、loans Server Actions
- Netlify DB（PostgreSQL）: `loans` テーブルのマイグレーション

### デプロイ手順
1. `npx drizzle-kit generate` でマイグレーションファイル生成
2. `npx drizzle-kit migrate` で DB マイグレーション実行
3. Netlify へデプロイ（git push → Netlify CI/CD）

### ロールバック
- DB: マイグレーションのダウンスクリプトで `loans` テーブルを DROP
- アプリ: Netlify の前バージョンへのロールバック機能を使用

---

## 6. 承認ゲート

- [x] スコープが合意されている
- [x] デザイン差分が適切である
- [x] テスト観点が適切である
- [x] デプロイ/ロールバックが適切である

承認者: 自動承認（PoC）
承認日: 2026-04-14

---

## Outcome（完了後に記入）
- 完了したこと:
  - `src/schema.ts` に `loans` テーブル追加
  - `drizzle/0003_damp_vanisher.sql` マイグレーションファイル生成（`npx drizzle-kit generate` 実行済み）
  - `app/actions/loans.ts` の `loanItem`、`returnItem` Server Actions 実装
    - `loanItem`: 既貸出中チェック → INSERT → `/items/${itemId}/scan` へリダイレクト
    - `returnItem`: returnedAt を UPDATE → `/items/${itemId}/scan` へリダイレクト
  - `app/items/[id]/scan/page.tsx` — 貸出・返却操作ページ（在庫あり/貸出中の条件分岐表示、Badge）
  - `app/scan/page.tsx` — QRスキャンページ（Client Component、`@zxing/browser` BrowserMultiFormatReader、IScannerControls.stop() で停止）
  - `app/page.tsx` — QRスキャンリンクカード追加
  - `components/ui/badge.tsx` — shadcn Badge コンポーネント追加
  - `@zxing/browser`、`@zxing/library` ライブラリインストール
  - `npx tsc --noEmit` でビルドエラーなし確認済み
- 完了しなかったこと:
  - `npx drizzle-kit migrate` によるDBへの実テーブル作成（接続情報が必要なため未実行）
- 変更されたデザイン/前提:
  - `BrowserMultiFormatReader.reset()` はAPIに存在せず、`decodeFromVideoDevice` が返す `IScannerControls.stop()` を使用する実装に変更

## Open Issues
- 未解決事項: ローカル開発時の DB マイグレーション実行（`DATABASE_URL` または `NETLIFY_DATABASE_URL` 設定が必要）
- ブロッカー: なし
- 保留中の決定事項: なし

## 次の Bolt
- 次にやること: UNIT-003 bolt-001（貸出状況ダッシュボード・履歴）
- 次に必要な入力: `loans` テーブルが存在し、貸出・返却データが記録されていること

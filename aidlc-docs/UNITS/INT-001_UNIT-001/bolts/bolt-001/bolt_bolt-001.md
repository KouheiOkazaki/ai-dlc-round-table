# Bolt: bolt-001

## 0. Bolt 目的
- **対象 Intent:** INT-001
- **対象 Unit:** INT-001_UNIT-001（備品マスタ管理 + QRコード発行）
- **対象ユーザーストーリー:** US-001, US-002, US-003, US-004
- **Goal (Definition of Done):**
  - `items` テーブルが DB に作成されている
  - 備品の登録・編集・一覧・詳細ページが動作する
  - 詳細ページでQRコードが表示され、印刷ボタンが機能する

---

## 1. スコープ

### In Scope
- `items` テーブルの Drizzle スキーマ追加（`src/schema.ts`）
- Drizzle マイグレーション実行
- Server Actions: createItem, updateItem
- ページ実装:
  - `/items` — 備品一覧（shadcn/ui Table or Card）
  - `/items/new` — 備品登録フォーム
  - `/items/[id]/edit` — 備品編集フォーム
  - `/items/[id]` — 備品詳細 + QRコード表示
- QRコード生成: `qrcode.react` を使用した `<QRCodeSVG>` コンポーネント
- ナビゲーション: トップページ（既存 `/`）から `/items` へのリンク追加

### Out of Scope
- 備品の論理削除（MVP 後の拡張として保留）
- `loans` テーブルおよび貸出状況表示（UNIT-002 以降）
- 認証・権限管理

---

## 2. 依存関係・前提条件

### 依存関係
- 既存: `src/schema.ts`（`comments` テーブルはそのまま残す）
- 既存: `src/db.ts`（DB 接続、流用）
- 新規ライブラリ: `qrcode.react`

### 前提条件（環境）
- Netlify DB（PostgreSQL）接続が `DATABASE_URL` または `NETLIFY_DATABASE_URL` で設定済み
- Next.js App Router 環境

### 制約
- 既存の `comments` テーブルへの影響がないこと

---

## 3. デザイン差分（Design Diff）

### DB スキーマ追加（`src/schema.ts`）
```ts
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  qrCode: text("qr_code").notNull(),
  defaultLoanDays: integer("default_loan_days").default(7).notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});
```

### ページ構成（App Router）
```
app/
  items/
    page.tsx              # 備品一覧
    new/
      page.tsx            # 備品登録
    [id]/
      page.tsx            # 備品詳細 + QRコード
      edit/
        page.tsx          # 備品編集
  actions/
    items.ts              # Server Actions (createItem, updateItem)
components/
  QRCodeDisplay.tsx       # QRコード表示コンポーネント（Client Component）
```

### QRコード URL 仕様
- フォーマット: `{NEXT_PUBLIC_APP_URL}/items/{itemId}/scan`
- 備品登録時に `itemId` が採番されるため、INSERT 後に `qr_code` を UPDATE するか、登録後のリダイレクト先で確定する
- 実装方針: INSERT 後に返却された `id` を使って `qr_code` を設定する（2ステップ INSERT + UPDATE）

### API/エラー処理
- 備品名が空の場合: フォームバリデーション（required）でブロック
- DB エラー: try/catch でエラーメッセージを返す

---

## 4. 実装 & テスト

### 対象ファイル（新規/変更）
| ファイル | 種別 | 説明 |
|---------|------|------|
| `src/schema.ts` | 変更 | `items` テーブル追加 |
| `drizzle/migrations/` | 自動生成 | マイグレーションファイル |
| `app/actions/items.ts` | 新規 | createItem, updateItem Server Actions |
| `app/items/page.tsx` | 新規 | 備品一覧ページ |
| `app/items/new/page.tsx` | 新規 | 備品登録ページ |
| `app/items/[id]/page.tsx` | 新規 | 備品詳細ページ |
| `app/items/[id]/edit/page.tsx` | 新規 | 備品編集ページ |
| `components/QRCodeDisplay.tsx` | 新規 | QRコード表示（Client Component） |
| `app/page.tsx` | 変更 | `/items` へのナビゲーションリンク追加 |

### テスト観点
- 備品を登録すると一覧に表示されること
- 備品を編集すると一覧・詳細に反映されること
- 詳細ページでQRコードが表示されること
- QRコードのURL が `/items/{id}/scan` 形式であること
- 備品名が空の場合は登録できないこと

---

## 5. デプロイユニット

### 影響するデプロイ対象
- Netlify（Next.js App）: 全ページ変更を含む
- Netlify DB（PostgreSQL）: `items` テーブルのマイグレーション

### デプロイ手順
1. `npx drizzle-kit generate` でマイグレーションファイル生成
2. `npx drizzle-kit migrate` で DB マイグレーション実行
3. Netlify へデプロイ（git push → Netlify CI/CD）

### ロールバック
- DB: マイグレーションのダウンスクリプトで `items` テーブルを DROP
- アプリ: Netlify の前バージョンへのロールバック機能を使用

---

## 6. 承認ゲート

- [ ] スコープが合意されている
- [ ] デザイン差分が適切である
- [ ] テスト観点が適切である
- [ ] デプロイ/ロールバックが適切である

承認者:
承認日:

---

## Outcome（完了後に記入）
- 完了したこと:
  - `src/schema.ts` に `items` テーブル追加（`integer` import 追加含む）
  - `drizzle/0002_outgoing_doctor_doom.sql` マイグレーションファイル生成（`npx drizzle-kit generate` 実行済み）
  - `app/actions/items.ts` の `createItem`、`updateItem` Server Actions 実装
    - `createItem`: INSERT 後に id を取得し qrCode を `{NEXT_PUBLIC_APP_URL}/items/{id}/scan` で UPDATE（フォールバック: `http://localhost:3000`）
    - `updateItem`: 備品情報を UPDATE、`/items/{id}` へリダイレクト
  - `components/QRCodeDisplay.tsx` 実装（Client Component、`qrcode.react` の `QRCodeSVG`、印刷ボタン）
  - `app/items/page.tsx` — 備品一覧ページ（shadcn/ui Table 使用）
  - `app/items/new/page.tsx` — 備品登録フォーム
  - `app/items/[id]/page.tsx` — 備品詳細 + QRコード表示
  - `app/items/[id]/edit/page.tsx` — 備品編集フォーム
  - `app/page.tsx` — 備品管理リンクカードを追加
  - `npx tsc --noEmit` でビルドエラーなし確認済み
- 完了しなかったこと:
  - `npx drizzle-kit migrate` によるDB実テーブル作成（ローカル環境に `.env.local` / `DATABASE_URL` が未設定のため未実行。Netlify デプロイ時または DB 接続情報設定後に実行が必要）
- 変更されたデザイン/前提:
  - `Button asChild` は既存の `@base-ui/react/button` ベースのコンポーネントで未サポートのため、`Link` + `buttonVariants` のパターンに変更
  - `items` テーブルの `deletedAt` カラムは MVP スコープ外として除外（Bolt 仕様書の In Scope 通り）

## Open Issues
- 未解決事項: ローカル開発時の DB マイグレーション実行（`DATABASE_URL` または `NETLIFY_DATABASE_URL` 設定が必要）
- ブロッカー: なし（コード実装は完了）
- 保留中の決定事項: なし

## 次の Bolt
- 次にやること: UNIT-002 bolt-001（QRスキャン + 貸出・返却操作）
- 次に必要な入力: `items` テーブルが存在し、QRコードURLの形式（`/items/{id}/scan`）が確定していること
- リスク: スマートフォンのブラウザカメラAPIの互換性

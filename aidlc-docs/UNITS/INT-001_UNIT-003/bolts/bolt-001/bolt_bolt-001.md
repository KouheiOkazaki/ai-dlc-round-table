# Bolt-001: 貸出状況ダッシュボード + 履歴機能

## Bolt ID
UNIT-003 / Bolt-001

## 概要
貸出状況ダッシュボードページ（`/dashboard`）と貸出・返却履歴ページ（`/history`）を Next.js App Router の Server Component として構築する。
トップページのナビゲーションにも両ページへのリンクを追加する。

## 対象ファイル
| ファイル | 種別 |
|---|---|
| `app/dashboard/page.tsx` | 新規作成 |
| `app/history/page.tsx` | 新規作成 |
| `app/page.tsx` | 更新（ナビリンク追加） |

## 実装方針

### app/dashboard/page.tsx
- Server Component、`force-dynamic` レンダリング
- `items` と `loans`（returnedAt IS NULL）を leftJoin して全備品の貸出状況を取得
- shadcn/ui Table で表示（列: 備品名 / 状態 Badge / 借用者名 / 貸出日 / 返却予定日 / 経過日数）
- 状態 Badge のバリアント:
  - 在庫あり: `secondary`
  - 貸出中: `default`
  - 期限超過: `destructive`（dueDate < now かつ returnedAt IS NULL）
- 期限超過行は `bg-destructive/10` でハイライト
- ページ上部に「備品管理へ」「QRスキャン」「履歴」ナビゲーションリンク

### app/history/page.tsx
- Server Component、`force-dynamic` レンダリング
- `loans` と `items` を innerJoin し `loanedAt DESC` 全件取得
- shadcn/ui Table で表示（列: 備品名 / 借用者名 / 貸出日時 / 返却予定日 / 返却日時 / 状態）
- ページ上部に「ダッシュボードへ」「備品管理へ」リンク

### app/page.tsx
- 「ダッシュボード（/dashboard）」「履歴（/history）」へのリンクを追加

## 依存関係
- `src/schema.ts`: `items`, `loans` テーブル
- `src/db.ts`: `db` インスタンス
- Drizzle ORM: `eq`, `desc`, `and`, `isNull`
- shadcn/ui: `Badge`, `Button`, `Card`, `Table`（既存インストール済み）

## Outcome
- [x] `app/dashboard/page.tsx` 実装完了
- [x] `app/history/page.tsx` 実装完了
- [x] `app/page.tsx` ナビゲーション更新完了
- [x] `npx tsc --noEmit` エラーなし

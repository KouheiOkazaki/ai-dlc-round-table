# INT-001 UNIT-001: 備品マスタ管理 + QRコード発行

## 目的（Purpose）
備品の登録・編集・一覧表示と、各備品へのQRコード発行・表示機能を実装する。
後続 Unit（UNIT-002, UNIT-003）が依存する `items` テーブルスキーマもここで確立する。

## 境界（Boundaries）
### 含むもの
- `items` テーブルの Drizzle スキーマ定義とマイグレーション
- 備品一覧ページ（`/items`）
- 備品登録ページ（`/items/new`）
- 備品編集ページ（`/items/[id]/edit`）
- 備品詳細ページ（`/items/[id]`）+ QRコード表示
- QRコード生成コンポーネント
- ナビゲーション（トップページへのリンク含む）

### 含まないもの
- `loans` テーブルおよび貸出・返却操作（UNIT-002）
- 貸出状況ダッシュボード・履歴（UNIT-003）

## 依存関係（Dependencies）
- 既存コードベース: Next.js App Router, Drizzle ORM, shadcn/ui
- 追加ライブラリ: `qrcode.react`（QRコード生成）

## 担当ユーザーストーリー
- US-001: 備品の登録
- US-002: 備品の編集
- US-003: 備品一覧の表示
- US-004: QRコードの表示・印刷

## Bolt 一覧
- bolt-001: 備品マスタ CRUD + QRコード発行（初期実装）

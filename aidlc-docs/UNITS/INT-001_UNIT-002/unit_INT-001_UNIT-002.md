# INT-001 UNIT-002: QRコードスキャン + 貸出・返却操作

## 目的（Purpose）
スマートフォンのカメラでQRコードを読み取り、備品の貸出・返却を記録する機能を実装する。

## 境界（Boundaries）
### 含むもの
- `loans` テーブルの Drizzle スキーマ定義とマイグレーション
- スキャンページ（`/scan`）: カメラ起動・QR読み取り
- 貸出・返却操作ページ（`/items/[id]/scan`）
- 貸出 Server Action
- 返却 Server Action

### 含まないもの
- 備品マスタ管理（UNIT-001）
- 貸出状況ダッシュボード・履歴（UNIT-003）

## 依存関係（Dependencies）
- UNIT-001: `items` テーブル、備品ID ベースの URL 構造
- 追加ライブラリ: `html5-qrcode` または `@zxing/browser`（QRスキャン）

## 担当ユーザーストーリー
- US-005: QRコードスキャンによる貸出
- US-006: QRコードスキャンによる返却

## Bolt 一覧
- bolt-001: QRスキャン画面 + 貸出・返却 Server Actions

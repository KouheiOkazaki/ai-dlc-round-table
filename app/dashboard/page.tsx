import Link from "next/link";
import { eq, and, isNull, isNotNull, lt } from "drizzle-orm";
import { db } from "@/src/db";
import { items, loans } from "@/src/schema";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  return db
    .select({ item: items, loan: loans })
    .from(items)
    .leftJoin(loans, and(eq(loans.itemId, items.id), isNull(loans.returnedAt)));
}

async function getSummary() {
  const [totalItems, activeLoans, overdueLoans] = await Promise.all([
    db.select({ id: items.id }).from(items),
    db.select({ id: loans.id }).from(loans).where(isNull(loans.returnedAt)),
    db
      .select({ id: loans.id })
      .from(loans)
      .where(and(isNull(loans.returnedAt), lt(loans.dueDate, new Date()))),
  ]);
  return {
    total: totalItems.length,
    active: activeLoans.length,
    overdue: overdueLoans.length,
    available: totalItems.length - activeLoans.length,
  };
}

function calcElapsedDays(loanedAt: Date): number {
  return Math.floor((Date.now() - loanedAt.getTime()) / 86400000);
}

export default async function DashboardPage() {
  const [rows, summary] = await Promise.all([getDashboardData(), getSummary()]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">ダッシュボード</h1>
        <p className="text-xs text-gray-500 mt-0.5">備品の現在の貸出状況</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "備品総数", value: summary.total, color: "text-gray-800" },
          { label: "在庫あり", value: summary.available, color: "text-emerald-700" },
          { label: "貸出中", value: summary.active, color: "text-blue-700" },
          { label: "期限超過", value: summary.overdue, color: "text-red-700" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-md px-4 py-3"
          >
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* 貸出状況テーブル */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">備品一覧（貸出状況）</h2>
          <Link
            href="/items/new"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            + 備品登録
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">備品が登録されていません。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">備品名</TableHead>
                <TableHead className="text-xs">状態</TableHead>
                <TableHead className="text-xs">借用者</TableHead>
                <TableHead className="text-xs">貸出日</TableHead>
                <TableHead className="text-xs">返却予定日</TableHead>
                <TableHead className="text-xs">経過日数</TableHead>
                <TableHead className="text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ item, loan }) => {
                const hasLoan = loan !== null;
                const overdue =
                  hasLoan && loan.dueDate !== null && loan.dueDate < new Date();

                let badgeVariant: "secondary" | "default" | "destructive" =
                  "secondary";
                let statusLabel = "在庫あり";
                if (hasLoan && overdue) {
                  badgeVariant = "destructive";
                  statusLabel = "期限超過";
                } else if (hasLoan) {
                  badgeVariant = "default";
                  statusLabel = "貸出中";
                }

                return (
                  <TableRow
                    key={item.id}
                    className={overdue ? "bg-red-50" : undefined}
                  >
                    <TableCell className="font-medium text-sm">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant} className="text-xs">
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {hasLoan ? loan.borrowerName : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {hasLoan
                        ? loan.loanedAt.toLocaleDateString("ja-JP")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {hasLoan
                        ? loan.dueDate.toLocaleDateString("ja-JP")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {hasLoan
                        ? `${calcElapsedDays(loan.loanedAt)} 日`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/items/${item.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        詳細
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

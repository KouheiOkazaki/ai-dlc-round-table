import { eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { items, loans } from "@/src/schema";
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

async function getHistoryData() {
  return db
    .select({ loan: loans, itemName: items.name })
    .from(loans)
    .innerJoin(items, eq(loans.itemId, items.id))
    .orderBy(desc(loans.loanedAt));
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleString("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function HistoryPage() {
  const rows = await getHistoryData();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">貸出履歴</h1>
        <p className="text-xs text-gray-500 mt-0.5">全貸出・返却の履歴（新しい順）</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">履歴がありません。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">備品名</TableHead>
                <TableHead className="text-xs">借用者</TableHead>
                <TableHead className="text-xs">貸出日時</TableHead>
                <TableHead className="text-xs">返却予定日</TableHead>
                <TableHead className="text-xs">返却日時</TableHead>
                <TableHead className="text-xs">状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ loan, itemName }) => {
                const returned = loan.returnedAt !== null;
                const overdue =
                  !returned && loan.dueDate < new Date();

                let badgeVariant: "secondary" | "default" | "destructive" =
                  "default";
                let statusLabel = "貸出中";
                if (returned) {
                  badgeVariant = "secondary";
                  statusLabel = "返却済";
                } else if (overdue) {
                  badgeVariant = "destructive";
                  statusLabel = "期限超過";
                }

                return (
                  <TableRow key={loan.id} className={overdue ? "bg-red-50" : undefined}>
                    <TableCell className="font-medium text-sm">
                      {itemName}
                    </TableCell>
                    <TableCell className="text-sm">{loan.borrowerName}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(loan.loanedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {loan.dueDate.toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(loan.returnedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant} className="text-xs">
                        {statusLabel}
                      </Badge>
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

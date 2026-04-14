import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { items, loans } from "@/src/schema";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    .select({
      loan: loans,
      itemName: items.name,
    })
    .from(loans)
    .innerJoin(items, eq(loans.itemId, items.id))
    .orderBy(desc(loans.loanedAt));
}

function isOverdue(dueDate: Date, returnedAt: Date | null): boolean {
  if (returnedAt !== null) return false;
  return dueDate < new Date();
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
    <div className="min-h-full bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ナビゲーション */}
        <nav className="flex flex-wrap gap-2">
          <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
            ダッシュボードへ
          </Link>
          <Link href="/items" className={buttonVariants({ variant: "outline", size: "sm" })}>
            備品管理へ
          </Link>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>貸出・返却履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">履歴がありません。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>備品名</TableHead>
                    <TableHead>借用者名</TableHead>
                    <TableHead>貸出日時</TableHead>
                    <TableHead>返却予定日</TableHead>
                    <TableHead>返却日時</TableHead>
                    <TableHead>状態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ loan, itemName }) => {
                    const returned = loan.returnedAt !== null;
                    const overdue = isOverdue(loan.dueDate, loan.returnedAt);

                    let badgeVariant: "secondary" | "default" | "destructive" = "default";
                    let statusLabel = "貸出中";
                    if (returned) {
                      badgeVariant = "secondary";
                      statusLabel = "返却済";
                    } else if (overdue) {
                      badgeVariant = "destructive";
                      statusLabel = "期限超過";
                    }

                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{itemName}</TableCell>
                        <TableCell>{loan.borrowerName}</TableCell>
                        <TableCell>{formatDate(loan.loanedAt)}</TableCell>
                        <TableCell>
                          {loan.dueDate.toLocaleDateString("ja-JP")}
                        </TableCell>
                        <TableCell>{formatDate(loan.returnedAt)}</TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant}>{statusLabel}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

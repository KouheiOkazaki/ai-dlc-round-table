import Link from "next/link";
import { eq, and, isNull } from "drizzle-orm";
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

async function getDashboardData() {
  return db
    .select({
      item: items,
      loan: loans,
    })
    .from(items)
    .leftJoin(loans, and(eq(loans.itemId, items.id), isNull(loans.returnedAt)));
}

function calcElapsedDays(loanedAt: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - loanedAt.getTime()) / (1000 * 60 * 60 * 24));
}

function isOverdue(dueDate: Date): boolean {
  return dueDate < new Date();
}

export default async function DashboardPage() {
  const rows = await getDashboardData();

  return (
    <div className="min-h-full bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ナビゲーション */}
        <nav className="flex flex-wrap gap-2">
          <Link href="/items" className={buttonVariants({ variant: "outline", size: "sm" })}>
            備品管理へ
          </Link>
          <Link href="/scan" className={buttonVariants({ variant: "outline", size: "sm" })}>
            QRスキャン
          </Link>
          <Link href="/history" className={buttonVariants({ variant: "outline", size: "sm" })}>
            履歴
          </Link>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>貸出状況ダッシュボード</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">備品が登録されていません。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>備品名</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>借用者名</TableHead>
                    <TableHead>貸出日</TableHead>
                    <TableHead>返却予定日</TableHead>
                    <TableHead>経過日数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ item, loan }) => {
                    const hasLoan = loan !== null;
                    const overdue = hasLoan && loan.dueDate !== null && isOverdue(loan.dueDate);

                    let badgeVariant: "secondary" | "default" | "destructive" = "secondary";
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
                        className={overdue ? "bg-destructive/10" : undefined}
                      >
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant}>{statusLabel}</Badge>
                        </TableCell>
                        <TableCell>
                          {hasLoan ? loan.borrowerName : "-"}
                        </TableCell>
                        <TableCell>
                          {hasLoan
                            ? loan.loanedAt.toLocaleDateString("ja-JP")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {hasLoan
                            ? loan.dueDate.toLocaleDateString("ja-JP")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {hasLoan
                            ? `${calcElapsedDays(loan.loanedAt)} 日`
                            : "-"}
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

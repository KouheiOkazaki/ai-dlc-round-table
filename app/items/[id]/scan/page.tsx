import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { items, loans } from "@/src/schema";
import { loanItem, returnItem } from "@/app/actions/loans";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ItemScanPage({ params }: Props) {
  const { id } = await params;
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    notFound();
  }

  const itemResult = await db.select().from(items).where(eq(items.id, itemId));

  if (itemResult.length === 0) {
    notFound();
  }

  const item = itemResult[0];

  // 貸出中レコードを取得（returnedAt IS NULL）
  const loanResult = await db
    .select()
    .from(loans)
    .where(eq(loans.itemId, itemId));

  const activeLoan = loanResult.find((loan) => loan.returnedAt === null) ?? null;
  const isLoaned = activeLoan !== null;

  const defaultDueDate = new Date(Date.now() + item.defaultLoanDays * 86400000);
  const defaultDueDateStr = defaultDueDate.toISOString().split("T")[0];

  async function loanItemAction(formData: FormData) {
    "use server";
    await loanItem(itemId, formData);
  }

  async function returnItemAction() {
    "use server";
    if (activeLoan) {
      await returnItem(activeLoan.id);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{item.name}</CardTitle>
          <Badge variant={isLoaned ? "destructive" : "default"}>
            {isLoaned ? "貸出中" : "在庫あり"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoaned && activeLoan ? (
            <>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-muted-foreground">借用者</dt>
                  <dd>{activeLoan.borrowerName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-muted-foreground">貸出日</dt>
                  <dd>
                    {activeLoan.loanedAt.toLocaleString("ja-JP", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-muted-foreground">返却予定日</dt>
                  <dd>
                    {activeLoan.dueDate.toLocaleDateString("ja-JP", {
                      dateStyle: "short",
                    })}
                  </dd>
                </div>
              </dl>

              <Separator />

              <form action={returnItemAction}>
                <Button type="submit" variant="default" className="w-full">
                  返却する
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                借用者名と返却予定日を入力して貸出を記録します。
              </p>

              <form action={loanItemAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="borrowerName">借用者名</Label>
                  <Input
                    id="borrowerName"
                    name="borrowerName"
                    type="text"
                    placeholder="山田 太郎"
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">返却予定日</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={defaultDueDateStr}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  貸出する
                </Button>
              </form>
            </>
          )}

          <Separator />

          <Link
            href={`/items/${itemId}`}
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
          >
            備品詳細へ
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

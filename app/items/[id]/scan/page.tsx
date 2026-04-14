import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { items, loans } from "@/src/schema";
import { loanItem, returnItem } from "@/app/actions/loans";
import { Button, buttonVariants } from "@/components/ui/button";
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
  if (isNaN(itemId)) notFound();

  const itemResult = await db.select().from(items).where(eq(items.id, itemId));
  if (itemResult.length === 0) notFound();

  const item = itemResult[0];

  const loanResult = await db
    .select()
    .from(loans)
    .where(eq(loans.itemId, itemId));

  const activeLoan = loanResult.find((loan) => loan.returnedAt === null) ?? null;
  const isLoaned = activeLoan !== null;

  const defaultDueDate = new Date(
    Date.now() + item.defaultLoanDays * 86400000
  );
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
    <div className="p-6 max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{item.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">貸出・返却操作</p>
        </div>
        <Badge variant={isLoaned ? "destructive" : "secondary"}>
          {isLoaned ? "貸出中" : "在庫あり"}
        </Badge>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6 space-y-4">
        {isLoaned && activeLoan ? (
          <>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: "借用者", value: activeLoan.borrowerName },
                  {
                    label: "貸出日",
                    value: activeLoan.loanedAt.toLocaleString("ja-JP", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }),
                  },
                  {
                    label: "返却予定日",
                    value: activeLoan.dueDate.toLocaleDateString("ja-JP"),
                  },
                ].map(({ label, value }) => (
                  <tr key={label}>
                    <th className="py-2 pr-4 text-left text-xs font-medium text-gray-500 w-32">
                      {label}
                    </th>
                    <td className="py-2 text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator />

            <form action={returnItemAction}>
              <Button type="submit" className="w-full">
                返却する
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              借用者名と返却予定日を入力して貸出を記録します。
            </p>
            <form action={loanItemAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="borrowerName" className="text-sm font-medium">
                  借用者名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="borrowerName"
                  name="borrowerName"
                  type="text"
                  placeholder="山田 太郎"
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDate" className="text-sm font-medium">
                  返却予定日 <span className="text-red-500">*</span>
                </Label>
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
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}
        >
          備品詳細へ戻る
        </Link>
      </div>
    </div>
  );
}

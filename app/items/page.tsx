import Link from "next/link";
import { db } from "@/src/db";
import { items } from "@/src/schema";
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
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const allItems = await db.select().from(items);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>備品一覧</CardTitle>
          <Link href="/items/new" className={buttonVariants({ variant: "default" })}>
            新規登録
          </Link>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              備品が登録されていません。
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>デフォルト貸出日数</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description ?? "-"}</TableCell>
                    <TableCell>{item.defaultLoanDays} 日</TableCell>
                    <TableCell>
                      {item.createdAt.toLocaleString("ja-JP", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/items/${item.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        詳細
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

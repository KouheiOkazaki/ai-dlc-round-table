import Link from "next/link";
import { db } from "@/src/db";
import { items } from "@/src/schema";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const allItems = await db.select().from(items);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">備品マスタ</h1>
          <p className="text-xs text-gray-500 mt-0.5">登録備品の一覧・管理</p>
        </div>
        <Link
          href="/items/new"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          + 備品登録
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {allItems.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">備品が登録されていません。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">備品名</TableHead>
                <TableHead className="text-xs">説明</TableHead>
                <TableHead className="text-xs">デフォルト貸出日数</TableHead>
                <TableHead className="text-xs">登録日</TableHead>
                <TableHead className="text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-gray-400">
                    {item.id}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {item.description ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm">{item.defaultLoanDays} 日</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {item.createdAt.toLocaleDateString("ja-JP")}
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
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

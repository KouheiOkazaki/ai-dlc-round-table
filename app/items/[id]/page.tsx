import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { items } from "@/src/schema";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) notFound();

  const result = await db.select().from(items).where(eq(items.id, itemId));
  if (result.length === 0) notFound();

  const item = result[0];

  return (
    <div className="p-6 max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{item.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">備品詳細</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/items/${item.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            編集
          </Link>
          <Link
            href="/items"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            一覧へ
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6 space-y-4">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {[
              { label: "備品ID", value: item.id },
              { label: "備品名", value: item.name },
              { label: "説明", value: item.description ?? "-" },
              { label: "デフォルト貸出日数", value: `${item.defaultLoanDays} 日` },
              {
                label: "登録日",
                value: item.createdAt.toLocaleString("ja-JP", {
                  dateStyle: "short",
                  timeStyle: "short",
                }),
              },
            ].map(({ label, value }) => (
              <tr key={label}>
                <th className="py-2 pr-4 text-left text-xs font-medium text-gray-500 w-40">
                  {label}
                </th>
                <td className="py-2 text-gray-800">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Separator />

        <div>
          <p className="text-xs font-medium text-gray-500 mb-3">QRコード</p>
          {item.qrCode ? (
            <QRCodeDisplay value={item.qrCode} itemName={item.name} />
          ) : (
            <p className="text-sm text-gray-400">QRコードが生成されていません。</p>
          )}
        </div>
      </div>
    </div>
  );
}

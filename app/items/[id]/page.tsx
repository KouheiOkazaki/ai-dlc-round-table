import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { items } from "@/src/schema";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    notFound();
  }

  const result = await db.select().from(items).where(eq(items.id, itemId));

  if (result.length === 0) {
    notFound();
  }

  const item = result[0];

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{item.name}</CardTitle>
          <Link
            href={`/items/${item.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            編集
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">説明</dt>
              <dd>{item.description ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">
                デフォルト貸出日数
              </dt>
              <dd>{item.defaultLoanDays} 日</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">登録日</dt>
              <dd>
                {item.createdAt.toLocaleString("ja-JP", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              QRコード
            </p>
            {item.qrCode ? (
              <QRCodeDisplay value={item.qrCode} itemName={item.name} />
            ) : (
              <p className="text-sm text-muted-foreground">
                QRコードが生成されていません。
              </p>
            )}
          </div>

          <Separator />

          <Link
            href="/items"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
          >
            一覧へ戻る
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

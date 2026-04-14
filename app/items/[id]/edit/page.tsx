import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { items } from "@/src/schema";
import { updateItem } from "@/app/actions/items";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: Props) {
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

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateItem(itemId, formData);
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>備品編集</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">備品名 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={item.name}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                name="description"
                type="text"
                defaultValue={item.description ?? ""}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultLoanDays">デフォルト貸出日数</Label>
              <Input
                id="defaultLoanDays"
                name="defaultLoanDays"
                type="number"
                min={1}
                defaultValue={item.defaultLoanDays}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                更新
              </Button>
              <Link
                href={`/items/${item.id}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                キャンセル
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

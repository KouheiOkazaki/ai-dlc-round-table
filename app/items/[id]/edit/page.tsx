import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { items } from "@/src/schema";
import { updateItem } from "@/app/actions/items";
import { Button, buttonVariants } from "@/components/ui/button";
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
  if (isNaN(itemId)) notFound();

  const result = await db.select().from(items).where(eq(items.id, itemId));
  if (result.length === 0) notFound();

  const item = result[0];

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateItem(itemId, formData);
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">備品編集</h1>
        <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6">
        <form action={handleUpdate} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              備品名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={item.name}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              説明
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              defaultValue={item.description ?? ""}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultLoanDays" className="text-sm font-medium">
              デフォルト貸出日数
            </Label>
            <Input
              id="defaultLoanDays"
              name="defaultLoanDays"
              type="number"
              min={1}
              defaultValue={item.defaultLoanDays}
              className="w-32"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit">更新する</Button>
            <Link
              href={`/items/${item.id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import { createItem } from "@/app/actions/items";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function NewItemPage() {
  return (
    <div className="p-6 max-w-xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">備品登録</h1>
        <p className="text-xs text-gray-500 mt-0.5">新しい備品を登録します</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6">
        <form action={createItem} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              備品名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="例: プロジェクター"
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
              placeholder="例: 会議室A用プロジェクター"
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
              defaultValue={7}
              className="w-32"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit">登録する</Button>
            <Link
              href="/items"
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

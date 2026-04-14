import Link from "next/link";
import { createItem } from "@/app/actions/items";
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

export default function NewItemPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>備品登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">備品名 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="例: プロジェクター"
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
                placeholder="例: 会議室A用プロジェクター"
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
                defaultValue={7}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                登録
              </Button>
              <Link
                href="/items"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                一覧へ戻る
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { comments } from "@/src/schema";

export const dynamic = "force-dynamic";

async function getComments() {
  const { db } = await import("@/src/db");
  return db.select().from(comments).orderBy(desc(comments.createdAt));
}

export default async function Page() {
  const list = await getComments();

  async function create(formData: FormData) {
    "use server";
    const { db } = await import("@/src/db");
    const comment = formData.get("comment");
    if (typeof comment !== "string" || comment.trim() === "") {
      return;
    }
    await db.insert(comments).values({ comment });
    revalidatePath("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-16 gap-6">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>備品管理</CardTitle>
          <CardDescription>
            備品のマスタ管理とQRコード発行を行います。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/dashboard" className={buttonVariants({ variant: "default" }) + " w-full"}>
            ダッシュボード
          </Link>
          <Link href="/history" className={buttonVariants({ variant: "outline" }) + " w-full"}>
            履歴
          </Link>
          <Link href="/items" className={buttonVariants({ variant: "outline" }) + " w-full"}>
            備品一覧へ
          </Link>
          <Link href="/scan" className={buttonVariants({ variant: "outline" }) + " w-full"}>
            QRスキャン（貸出・返却）
          </Link>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>
            コメントを入力して送信すると、一覧に反映されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={create} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">コメント</Label>
              <Input
                id="comment"
                name="comment"
                type="text"
                placeholder="write a comment"
                required
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>

          <Separator />

          <section aria-labelledby="comments-heading">
            <h2
              id="comments-heading"
              className="mb-3 text-sm font-medium text-muted-foreground"
            >
              登録済み（新しい順）
            </h2>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                まだコメントはありません。
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {list.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-2.5"
                  >
                    <p className="text-sm text-foreground">{row.comment}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.createdAt.toLocaleString("ja-JP", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

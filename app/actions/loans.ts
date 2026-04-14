"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { loans } from "@/src/schema";

export async function loanItem(
  itemId: number,
  formData: FormData
): Promise<{ error: string } | void> {
  const borrowerName = formData.get("borrowerName");
  const dueDateStr = formData.get("dueDate");

  if (typeof borrowerName !== "string" || borrowerName.trim() === "") {
    return { error: "借用者名を入力してください。" };
  }

  if (typeof dueDateStr !== "string" || dueDateStr.trim() === "") {
    return { error: "返却予定日を入力してください。" };
  }

  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) {
    return { error: "返却予定日の形式が正しくありません。" };
  }

  // 既に貸出中かチェック
  const existing = await db
    .select()
    .from(loans)
    .where(eq(loans.itemId, itemId));

  const activeLoans = existing.filter((loan) => loan.returnedAt === null);
  if (activeLoans.length > 0) {
    return { error: "この備品は現在貸出中です。" };
  }

  await db.insert(loans).values({
    itemId,
    borrowerName: borrowerName.trim(),
    dueDate,
  });

  redirect(`/items/${itemId}/scan`);
}

export async function returnItem(
  loanId: number
): Promise<{ error: string } | void> {
  const result = await db
    .select()
    .from(loans)
    .where(eq(loans.id, loanId));

  if (result.length === 0) {
    return { error: "貸出レコードが見つかりません。" };
  }

  const loan = result[0];
  const itemId = loan.itemId;

  await db
    .update(loans)
    .set({ returnedAt: new Date() })
    .where(eq(loans.id, loanId));

  redirect(`/items/${itemId}/scan`);
}

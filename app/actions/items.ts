"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { items } from "@/src/schema";

export async function createItem(formData: FormData) {
  const name = formData.get("name");
  const description = formData.get("description");
  const defaultLoanDays = formData.get("defaultLoanDays");

  if (typeof name !== "string" || name.trim() === "") {
    return;
  }

  const inserted = await db
    .insert(items)
    .values({
      name: name.trim(),
      description:
        typeof description === "string" && description.trim() !== ""
          ? description.trim()
          : null,
      defaultLoanDays:
        typeof defaultLoanDays === "string" && defaultLoanDays.trim() !== ""
          ? parseInt(defaultLoanDays.trim(), 10)
          : 7,
      qrCode: "",
    })
    .returning({ id: items.id });

  const id = inserted[0].id;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qrCode = `${appUrl}/items/${id}/scan`;

  await db.update(items).set({ qrCode }).where(eq(items.id, id));

  redirect(`/items/${id}`);
}

export async function updateItem(id: number, formData: FormData) {
  const name = formData.get("name");
  const description = formData.get("description");
  const defaultLoanDays = formData.get("defaultLoanDays");

  if (typeof name !== "string" || name.trim() === "") {
    return;
  }

  await db
    .update(items)
    .set({
      name: name.trim(),
      description:
        typeof description === "string" && description.trim() !== ""
          ? description.trim()
          : null,
      defaultLoanDays:
        typeof defaultLoanDays === "string" && defaultLoanDays.trim() !== ""
          ? parseInt(defaultLoanDays.trim(), 10)
          : 7,
    })
    .where(eq(items.id, id));

  redirect(`/items/${id}`);
}

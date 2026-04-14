"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
  value: string;
  itemName: string;
}

export function QRCodeDisplay({ value, itemName }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg border border-border bg-white p-4 print:border-none">
        <QRCodeSVG value={value} size={200} />
        <p className="mt-2 text-center text-sm font-medium">{itemName}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => window.print()}
        className="print:hidden"
      >
        印刷
      </Button>
    </div>
  );
}

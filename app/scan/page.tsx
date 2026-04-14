"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IScannerControls } from "@zxing/browser";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, []);

  const startScan = async () => {
    setError(null);
    setScanning(true);

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();

      if (!videoRef.current) {
        setError("カメラの初期化に失敗しました。");
        setScanning(false);
        return;
      }

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            controls.stop();
            controlsRef.current = null;
            setScanning(false);
            const text = result.getText();
            // /items/{id}/scan 形式のURLか確認して遷移
            try {
              const url = new URL(text);
              router.push(url.pathname);
            } catch {
              // 相対パスの場合はそのまま使用
              if (text.startsWith("/items/") && text.endsWith("/scan")) {
                router.push(text);
              } else {
                setError(`認識したQRコード: ${text}\n（備品QRコードではありません）`);
              }
            }
          }
          if (err) {
            // スキャン中の通常エラー（NotFoundException 等）は無視
            const msg = err.message ?? "";
            if (!msg.includes("No MultiFormat Readers") && !msg.includes("NotFoundException")) {
              // 重大なエラーのみ表示
            }
          }
        }
      );

      controlsRef.current = controls;
    } catch (e) {
      console.error(e);
      setError("カメラの起動に失敗しました。カメラへのアクセスを許可してください。");
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>QRコードスキャン</CardTitle>
          <CardDescription>
            備品に貼られたQRコードをカメラで読み取り、貸出・返却操作を行います。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: scanning ? "block" : "none" }}
            />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                スキャン待機中
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive whitespace-pre-wrap">
              {error}
            </div>
          )}

          {!scanning ? (
            <Button onClick={startScan} className="w-full">
              スキャン開始
            </Button>
          ) : (
            <Button onClick={stopScan} variant="outline" className="w-full">
              スキャン停止
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

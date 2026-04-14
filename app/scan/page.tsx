"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { IScannerControls } from "@zxing/browser";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
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
        (result) => {
          if (result) {
            controls.stop();
            controlsRef.current = null;
            setScanning(false);
            const text = result.getText();
            try {
              const url = new URL(text);
              router.push(url.pathname);
            } catch {
              if (text.startsWith("/items/") && text.endsWith("/scan")) {
                router.push(text);
              } else {
                setError(`読み取ったQRコード: ${text}\n備品QRコードではありません。`);
              }
            }
          }
        }
      );
      controlsRef.current = controls;
    } catch {
      setError("カメラの起動に失敗しました。カメラへのアクセスを許可してください。");
      setScanning(false);
    }
  };

  const stopScan = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  };

  return (
    <div className="p-6 max-w-md space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">QRスキャン</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          備品に貼られたQRコードをカメラで読み取ります
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6 space-y-4">
        <div className="relative w-full aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ display: scanning ? "block" : "none" }}
          />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9V6a1 1 0 011-1h3M3 15v3a1 1 0 001 1h3m11-4v3a1 1 0 01-1 1h-3m4-11V6a1 1 0 00-1-1h-3"
                />
              </svg>
              <span className="text-xs">カメラ待機中</span>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 whitespace-pre-wrap">
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
      </div>
    </div>
  );
}

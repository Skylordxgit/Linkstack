"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrPanel({ url }: { url: string }) {
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: 480, margin: 1, color: { dark: "#000000", light: "#ffffff" } }).then(setPngUrl);
    QRCode.toString(url, { type: "svg", margin: 1 }).then(setSvgMarkup);
  }, [url]);

  const downloadSvg = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "qr-code.svg";
    a.click();
    URL.revokeObjectURL(href);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl bg-white p-4">
        {pngUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pngUrl} alt="QR code" className="h-48 w-48" />
        ) : (
          <div className="h-48 w-48 animate-pulse rounded-lg bg-black/10" />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="outline" size="sm" disabled={!pngUrl}>
          <a href={pngUrl ?? undefined} download="qr-code.png">
            <Download className="h-4 w-4" /> PNG
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSvg} disabled={!svgMarkup}>
          <Download className="h-4 w-4" /> SVG
        </Button>
        <Button variant="outline" size="sm" onClick={copyUrl}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy URL
        </Button>
      </div>
    </div>
  );
}

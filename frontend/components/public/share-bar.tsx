"use client";

import { useState } from "react";
import { Share2, QrCode, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/dynamic-icon";
import { QrPanel } from "@/components/public/qr-panel";
import type { Page } from "@/types";

interface ShareOption {
  id: string;
  label: string;
  icon: string;
  href: (url: string, title: string) => string;
}

const SHARE_OPTIONS: ShareOption[] = [
  { id: "whatsapp", label: "WhatsApp", icon: "MessageCircle", href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { id: "telegram", label: "Telegram", icon: "Send", href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id: "facebook", label: "Facebook", icon: "Facebook", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { id: "x", label: "X", icon: "Twitter", href: (u, t) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id: "email", label: "Email", icon: "Mail", href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}` },
];

export function ShareBar({ page }: { page: Page }) {
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = page.seoTitle || page.title;

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fall through to modal
      }
    }
    setOpen(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="glass" size="sm" onClick={handleNativeShare}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="glass" size="icon" onClick={() => setQrOpen(true)} aria-label="QR code">
          <QrCode className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this page</DialogTitle>
            <DialogDescription>Send this link anywhere.</DialogDescription>
          </DialogHeader>

          <button
            onClick={copyLink}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-white/5 px-4 py-3 text-sm"
          >
            <span className="truncate text-muted-foreground">{url}</span>
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {SHARE_OPTIONS.map((opt) => (
              <a
                key={opt.id}
                href={opt.href(url, title)}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs transition-colors hover:bg-white/5"
              >
                <DynamicIcon name={opt.icon} className="h-5 w-5" />
                {opt.label}
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>Scan to open this page.</DialogDescription>
          </DialogHeader>
          <QrPanel url={url} />
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Star,
  Link2,
  Heading,
  Type,
  Minus,
  MoveVertical,
  Image as ImageIcon,
  Video,
  Phone,
  LayoutGrid,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaPicker } from "@/components/admin/media-picker";
import { BUTTON_ANIMATIONS } from "@/lib/themes";
import { LINK_PRESETS, buildWhatsAppUrl, buildTelegramUrl, buildMailtoUrl, buildTelUrl } from "@/lib/socials";
import type { Block } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<Block["type"], any> = {
  LINK: Link2,
  HEADING: Heading,
  TEXT: Type,
  DIVIDER: Minus,
  SPACER: MoveVertical,
  IMAGE: ImageIcon,
  VIDEO: Video,
  CONTACT: Phone,
  SOCIAL_ICONS: LayoutGrid,
};

export function BlockCard({
  block,
  onPatch,
  onRemove,
  onDuplicate,
}: {
  block: Block;
  onPatch: (patch: Partial<Block>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = TYPE_ICON[block.type];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("[--glass-opacity:0.05] [--glass-blur:16px]", isDragging && "opacity-60")}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <button className="min-w-0 flex-1 text-left" onClick={() => setExpanded((v) => !v)}>
          <p className="truncate text-sm font-medium">
            {block.title || block.description || `${block.type.replace("_", " ")} block`}
          </p>
        </button>
        {block.featured && <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
        <Switch checked={block.enabled} onCheckedChange={(v) => onPatch({ enabled: v })} />
        <Button variant="ghost" size="icon" onClick={onDuplicate} aria-label="Duplicate">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Delete">
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setExpanded((v) => !v)} aria-label="Expand">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-white/10 p-4">
          <BlockFields block={block} onPatch={onPatch} />
        </div>
      )}
    </Card>
  );
}

function BlockFields({ block, onPatch }: { block: Block; onPatch: (patch: Partial<Block>) => void }) {
  switch (block.type) {
    case "LINK":
      return <LinkFields block={block} onPatch={onPatch} />;
    case "HEADING":
      return (
        <div className="flex flex-col gap-1.5">
          <Label>Heading text</Label>
          <Input value={block.title ?? ""} onChange={(e) => onPatch({ title: e.target.value })} />
        </div>
      );
    case "TEXT":
      return (
        <div className="flex flex-col gap-1.5">
          <Label>Text</Label>
          <Textarea value={block.description ?? ""} onChange={(e) => onPatch({ description: e.target.value })} />
        </div>
      );
    case "SPACER":
      return (
        <div className="flex flex-col gap-1.5">
          <Label>Height (px)</Label>
          <Input
            type="number"
            value={(block.config?.height as number) ?? 16}
            onChange={(e) => onPatch({ config: { ...block.config, height: Number(e.target.value) } })}
          />
        </div>
      );
    case "IMAGE":
      return (
        <div className="flex flex-col gap-1.5">
          <Label>Image</Label>
          <MediaPicker usage="thumbnail" value={block.thumbnail ?? ""} onChange={(url) => onPatch({ thumbnail: url })} />
        </div>
      );
    case "VIDEO":
      return (
        <div className="flex flex-col gap-1.5">
          <Label>Video URL (MP4/WebM)</Label>
          <Input value={block.url ?? ""} onChange={(e) => onPatch({ url: e.target.value })} />
        </div>
      );
    case "CONTACT":
      return <ContactFields block={block} onPatch={onPatch} />;
    case "DIVIDER":
    case "SOCIAL_ICONS":
    default:
      return null;
  }
}

function LinkFields({ block, onPatch }: { block: Block; onPatch: (patch: Partial<Block>) => void }) {
  const preset = (block.config?.preset as string) || "custom";
  const isWhatsapp = preset === "whatsapp";
  const isTelegram = preset === "telegram";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Quick preset</Label>
        <Select
          value={preset}
          onValueChange={(v) => {
            const p = LINK_PRESETS.find((x) => x.id === v);
            onPatch({ icon: p?.icon, config: { ...block.config, preset: v } });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LINK_PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Title</Label>
        <Input value={block.title ?? ""} onChange={(e) => onPatch({ title: e.target.value })} />
      </div>

      {isWhatsapp ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Label>Phone number</Label>
            <Input
              placeholder="+919876543210"
              value={(block.config?.phone as string) ?? ""}
              onChange={(e) => {
                const phone = e.target.value;
                onPatch({
                  config: { ...block.config, phone },
                  url: buildWhatsAppUrl(phone, block.config?.message as string),
                });
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Prefilled message</Label>
            <Textarea
              value={(block.config?.message as string) ?? ""}
              onChange={(e) => {
                const message = e.target.value;
                onPatch({
                  config: { ...block.config, message },
                  url: buildWhatsAppUrl((block.config?.phone as string) ?? "", message),
                });
              }}
            />
          </div>
          <p className="truncate text-xs text-muted-foreground">{block.url}</p>
        </>
      ) : isTelegram ? (
        <div className="flex flex-col gap-1.5">
          <Label>Username or full URL</Label>
          <Input
            placeholder="username"
            value={(block.config?.handle as string) ?? ""}
            onChange={(e) => {
              const handle = e.target.value;
              onPatch({ config: { ...block.config, handle }, url: buildTelegramUrl(handle) });
            }}
          />
          <p className="truncate text-xs text-muted-foreground">{block.url}</p>
        </div>
      ) : preset === "email" ? (
        <div className="flex flex-col gap-1.5">
          <Label>Email address</Label>
          <Input
            type="email"
            value={(block.config?.email as string) ?? ""}
            onChange={(e) => {
              const email = e.target.value;
              onPatch({ config: { ...block.config, email }, url: buildMailtoUrl(email) });
            }}
          />
        </div>
      ) : preset === "phone" ? (
        <div className="flex flex-col gap-1.5">
          <Label>Phone number</Label>
          <Input
            value={(block.config?.phone as string) ?? ""}
            onChange={(e) => {
              const phone = e.target.value;
              onPatch({ config: { ...block.config, phone }, url: buildTelUrl(phone) });
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>URL</Label>
          <Input
            placeholder="https://"
            value={block.url ?? ""}
            onChange={(e) => onPatch({ url: e.target.value })}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Description</Label>
        <Input value={block.description ?? ""} onChange={(e) => onPatch({ description: e.target.value })} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Thumbnail</Label>
        <MediaPicker usage="thumbnail" value={block.thumbnail ?? ""} onChange={(url) => onPatch({ thumbnail: url })} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Animation</Label>
        <Select value={block.animation} onValueChange={(v) => onPatch({ animation: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUTTON_ANIMATIONS.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">Featured</Label>
        <Switch checked={block.featured} onCheckedChange={(v) => onPatch({ featured: v })} />
      </div>

      <div className="flex items-center justify-between">
        <Label>Open in new tab</Label>
        <Switch
          checked={(block.config?.newTab as boolean) ?? true}
          onCheckedChange={(v) => onPatch({ config: { ...block.config, newTab: v } })}
        />
      </div>
    </div>
  );
}

function ContactFields({ block, onPatch }: { block: Block; onPatch: (patch: Partial<Block>) => void }) {
  const kind = (block.config?.kind as string) || "email";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Kind</Label>
        <Select value={kind} onValueChange={(v) => onPatch({ config: { ...block.config, kind: v }, icon: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Title</Label>
        <Input value={block.title ?? ""} onChange={(e) => onPatch({ title: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{kind === "email" ? "Email address" : "Phone number"}</Label>
        <Input
          value={(block.config?.value as string) ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            const url = kind === "email" ? buildMailtoUrl(value) : buildTelUrl(value);
            onPatch({ config: { ...block.config, value }, url });
          }}
        />
      </div>
    </div>
  );
}

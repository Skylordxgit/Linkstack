"use client";

import {
  Link2,
  Heading,
  Type,
  Minus,
  MoveVertical,
  Image as ImageIcon,
  Video,
  Phone,
  LayoutGrid,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BlockType } from "@/types";

const OPTIONS: { type: BlockType; label: string; icon: any }[] = [
  { type: "LINK", label: "Link", icon: Link2 },
  { type: "HEADING", label: "Heading", icon: Heading },
  { type: "TEXT", label: "Text", icon: Type },
  { type: "DIVIDER", label: "Divider", icon: Minus },
  { type: "SPACER", label: "Spacer", icon: MoveVertical },
  { type: "IMAGE", label: "Image", icon: ImageIcon },
  { type: "VIDEO", label: "Video", icon: Video },
  { type: "CONTACT", label: "Contact", icon: Phone },
  { type: "SOCIAL_ICONS", label: "Social Icons", icon: LayoutGrid },
];

export function AddBlockMenu({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full border-dashed">
          <Plus className="h-4 w-4" /> Add Block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.type} onSelect={() => onAdd(opt.type)}>
            <opt.icon className="h-4 w-4" /> {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

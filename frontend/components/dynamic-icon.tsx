import * as Icons from "lucide-react";
import { Link2 } from "lucide-react";
import type { CSSProperties } from "react";

export function DynamicIcon({
  name,
  className,
  style,
}: {
  name?: string | null;
  className?: string;
  style?: CSSProperties;
}) {
  const Cmp = (name && (Icons as any)[name]) || Link2;
  return <Cmp className={className} style={style} />;
}

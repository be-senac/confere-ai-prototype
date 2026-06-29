import type { Classification } from "../lib/api";
import { ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";

interface Props {
  classification: Classification;
  size?: "sm" | "md" | "lg";
}

const CONFIG = {
  "Confiável": {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: ShieldCheck,
  },
  "Falsa": {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: ShieldX,
  },
  "Inconclusiva": {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: ShieldAlert,
  },
};

export default function ClassificationBadge({ classification, size = "md" }: Props) {
  const c = CONFIG[classification] || CONFIG["Inconclusiva"];
  const Icon = c.icon;

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  const iconSizes = { sm: 11, md: 13, lg: 16 };

  return (
    <span
      className={`inline-flex items-center rounded font-medium border ${c.bg} ${c.border} ${c.text} ${sizes[size]}`}
    >
      <Icon size={iconSizes[size]} />
      {classification}
    </span>
  );
}

import { useEffect, useState } from "react";

interface Props {
  label: string;
  value: number;
  color: "blue" | "red" | "green" | "yellow";
  delay?: number;
}

const COLORS = {
  blue:   { bar: "bg-accent", text: "text-accent" },
  red:    { bar: "bg-red-500", text: "text-red-600" },
  green:  { bar: "bg-emerald-500", text: "text-emerald-700" },
  yellow: { bar: "bg-amber-400", text: "text-amber-700" },
};

export default function PercentageBar({ label, value, color, delay = 0 }: Props) {
  const [animated, setAnimated] = useState(0);
  const c = COLORS[color];

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const duration = 900;
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimated(eased * value);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-semibold font-mono ${c.text}`}>{Math.round(animated)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full transition-none`}
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  );
}

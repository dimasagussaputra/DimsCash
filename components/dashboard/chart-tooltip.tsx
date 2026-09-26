import { formatCurrency } from "@/lib/utils";

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
  }>;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center gap-2 text-sm">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: item.color ?? item.fill }}
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-mono font-medium tabular-nums">
            {formatCurrency(Number(item.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
}

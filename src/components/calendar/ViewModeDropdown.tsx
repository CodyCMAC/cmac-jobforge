import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";

interface ViewModeDropdownProps {
  value: "monthly" | "weekly" | "daily";
  onChange: (value: "monthly" | "weekly" | "daily") => void;
}

export function ViewModeDropdown({ value, onChange }: ViewModeDropdownProps) {
  const options = [
    { label: "Monthly", value: "monthly" as const },
    { label: "Weekly", value: "weekly" as const },
    { label: "Daily", value: "daily" as const },
  ];

  const currentLabel = options.find(o => o.value === value)?.label || "Monthly";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {currentLabel}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center justify-between"
          >
            {option.label}
            {value === option.value && <Check className="w-4 h-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

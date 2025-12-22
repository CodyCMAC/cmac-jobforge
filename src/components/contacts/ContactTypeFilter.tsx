import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, Check } from "lucide-react";

interface ContactTypeFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function ContactTypeFilter({ value, onChange }: ContactTypeFilterProps) {
  const options = [
    { label: "All Types", value: null },
    { label: "Customer", value: "Customer" },
    { label: "Crew", value: "Crew" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          {value || "Type"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.label}
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

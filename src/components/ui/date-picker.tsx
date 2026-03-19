import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export type DatePickerProps = {
  /**
   * Date value in `YYYY-MM-DD` format (works well with input[type="date"] style storage).
   */
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export default function DatePicker({ value, onChange, disabled, className }: DatePickerProps) {
  const parsed = React.useMemo(() => {
    if (!value) return undefined;
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  }, [value]);

  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-xl border-border bg-background text-foreground",
            disabled ? "opacity-50" : "",
            className,
          )}
        >
          <span className="text-left">
            {parsed ? format(parsed, "yyyy-MM-dd") : <span className="text-muted-foreground">Select date</span>}
          </span>
          <CalendarIcon className="w-4 h-4 opacity-80" strokeWidth={1.5} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="max-h-[360px] overflow-auto">
          <Calendar
            mode="single"
            selected={parsed}
            onSelect={(d) => {
              if (!d) return;
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2035}
            className="p-3"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}


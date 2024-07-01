import { SelectSingleEventHandler } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type DatePickerProps = {
  value?: Date;
  onChange?: SelectSingleEventHandler;
  disabled?: boolean;
};

export const DatePicker = ({ value, onChange, disabled }: DatePickerProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        disabled={disabled}
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal gap-2",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="size-4" />
        {value ? format(value, "PPP") : <span>Pick a date</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <Calendar
        className="p-0"
        mode="single"
        selected={value}
        onSelect={onChange}
        disabled={disabled}
      />
    </PopoverContent>
  </Popover>
);

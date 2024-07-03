import {
  SelectTrigger,
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TableHeadSelectProps = {
  columnIndex: number;
  selectedColumns: Record<string, string | null>;
  onChange: (columnIndex: number, value: string | null) => void;
};

const OPTIONS = ["amount", "date", "payee"];

export const TableHeadSelect = ({
  columnIndex,
  selectedColumns,
  onChange,
}: TableHeadSelectProps) => {
  const currentSelection = selectedColumns[`column_${columnIndex}`];

  const handleSelect = (value: string) => onChange(columnIndex, value);

  return (
    <Select value={currentSelection || ""} onValueChange={handleSelect}>
      <SelectTrigger
        className={cn(
          "focus:ring-offset-0 focus:ring-transparent outline-none border-none bg-transparent capitalize",
          currentSelection && "text-blue-500"
        )}
      >
        <SelectValue placeholder="skip" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="skip">Skip</SelectItem>
        {OPTIONS.map((option, index) => {
          const isDisabled =
            Object.values(selectedColumns).includes(option) &&
            selectedColumns[`column_${columnIndex}`] !== option;

          return (
            <SelectItem
              value={option}
              key={option}
              className="capitalize"
              disabled={isDisabled}
            >
              {option}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

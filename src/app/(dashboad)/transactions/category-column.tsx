import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transcation";

type AccountColumnProps = {
  id: string;
  category: string | null;
  categoryId: string | null;
};

export const CategoryColumn = ({
  category,
  categoryId,
  id,
}: AccountColumnProps) => {
  const { onOpen } = useOpenCategory((state) => ({
    onOpen: state.onOpen,
  }));
  const { onOpen: onOpenTransaction } = useOpenTransaction((state) => ({
    onOpen: state.onOpen,
  }));

  const openHandler = () =>
    categoryId ? onOpen(categoryId) : onOpenTransaction(id);

  return (
    <div
      onClick={openHandler}
      className={cn(
        "flex items-center hover:underline cursor-pointer",
        !category && "text-rose-500"
      )}
    >
      {category || "Uncategorized"}
      {!category && <TriangleAlert className=" size-4" />}
    </div>
  );
};

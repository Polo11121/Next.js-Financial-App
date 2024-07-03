"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transcation";

type ActionsProps = {
  id: string;
};

export const TransactionActions = ({ id }: ActionsProps) => {
  const { onOpen } = useOpenTransaction((state) => ({
    onOpen: state.onOpen,
  }));
  const { mutate, isPending } = useDeleteTransaction(id);
  const [ConfirmationDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction. This action cannot be undone."
  );

  const editHandler = () => onOpen(id);

  const deleteHandler = async () => {
    const ok = await confirm();

    if (ok) {
      mutate();
    }
  };

  return (
    <>
      <ConfirmationDialog disabled={isPending} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled={isPending} onClick={editHandler}>
            <Edit className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isPending} onClick={deleteHandler}>
            <Trash className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

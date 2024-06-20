"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { AccountForm } from "@/features/accounts/components/account-form";
import { useGetAccount } from "@/features/accounts/api/use-get-account";
import { useEditAccount } from "@/features/accounts/api/use-edit-account";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-account";
import { insertAccountSchema } from "@/db/schema";
import { useConfirm } from "@/hooks/useConfirm";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const formSchema = insertAccountSchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditAccountSheet = () => {
  const { isOpen, onClose, id } = useOpenAccount((state) => ({
    isOpen: state.isOpen,
    onClose: state.onClose,
    id: state.id,
  }));
  const { data: account, isLoading } = useGetAccount(id);
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditAccount(id);
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteAccount(id);
  const [ConfirmationDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this account. This action cannot be undone."
  );

  const submitHandler = (values: FormValues) =>
    mutateEdit(values, {
      onSuccess: () => onClose(),
    });

  const deleteHandler = async () => {
    const ok = await confirm();

    if (ok) {
      mutateDelete(undefined, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isDisabled = isPendingEdit || isPendingDelete;

  return (
    <>
      <ConfirmationDialog disabled={isDisabled} />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Account</SheetTitle>
            <SheetDescription>
              Edit an existing account to track your financial transactions.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex justify-center items-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <AccountForm
              id={id}
              onSubmit={submitHandler}
              onDelete={deleteHandler}
              disabled={isDisabled}
              defaultValues={account}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

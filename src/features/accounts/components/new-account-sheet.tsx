"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { AccountForm } from "@/features/accounts/components/account-form";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { insertAccountSchema } from "@/db/schema";
import { z } from "zod";

const formSchema = insertAccountSchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewAccountSheet = () => {
  const { isOpen, onClose } = useNewAccount((state) => ({
    isOpen: state.isOpen,
    onClose: state.onClose,
  }));
  const { mutate, isPending } = useCreateAccount();

  const submitHandler = (values: FormValues) =>
    mutate(values, {
      onSuccess: () => onClose(),
    });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Account</SheetTitle>
          <SheetDescription>
            Create a new account to track your financial transactions.
          </SheetDescription>
        </SheetHeader>
        <AccountForm onSubmit={submitHandler} disabled={isPending} />
      </SheetContent>
    </Sheet>
  );
};

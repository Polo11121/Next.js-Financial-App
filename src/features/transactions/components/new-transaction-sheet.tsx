"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertTransactionSchema } from "@/db/schema";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { z } from "zod";

const formSchema = insertTransactionSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewTransactionSheet = () => {
  const { isOpen, onClose } = useNewTransaction((state) => ({
    isOpen: state.isOpen,
    onClose: state.onClose,
  }));

  const { mutate: createCategory, isPending: createCategoryLoading } =
    useCreateCategory();
  const { mutate: createAccount, isPending: createAccountLoading } =
    useCreateAccount();
  const { mutate: createTransition, isPending: createTransactionLoading } =
    useCreateTransaction();

  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { data: accounts, isLoading: accountsLoading } = useGetAccounts();

  const createCategoryHandler = (name: string) => createCategory({ name });
  const createAccountHandler = (name: string) => createAccount({ name });
  const submitHandler = (values: FormValues) =>
    createTransition(values, {
      onSuccess: () => onClose(),
    });

  const categoryOptions = (categories || []).map(({ name, id }) => ({
    label: name,
    value: id,
  }));
  const accountOptions = (accounts || []).map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const isLoading =
    createCategoryLoading ||
    createAccountLoading ||
    createTransactionLoading ||
    categoriesLoading ||
    accountsLoading;

  const isDisabled =
    createCategoryLoading ||
    createAccountLoading ||
    createTransactionLoading ||
    categoriesLoading ||
    accountsLoading ||
    isLoading;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>Add a new transaction.</SheetDescription>
        </SheetHeader>
        <TransactionForm
          onSubmit={submitHandler}
          categoryOptions={categoryOptions}
          accountOptions={accountOptions}
          onCreateCategory={createCategoryHandler}
          onCreateAccount={createAccountHandler}
          disabled={isDisabled}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  );
};

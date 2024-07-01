"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertTransactionSchema } from "@/db/schema";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { z } from "zod";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transcation";
import { useGetTransaction } from "@/features/transactions/api/use-get-transaction";
import { useEditTransaction } from "@/features/transactions/api/use-edit-transaction";
import { Loader2 } from "lucide-react";
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";

const formSchema = insertTransactionSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction((state) => ({
    isOpen: state.isOpen,
    onClose: state.onClose,
    id: state.id,
  }));

  const { mutate: createCategory, isPending: createCategoryLoading } =
    useCreateCategory();
  const { mutate: createAccount, isPending: createAccountLoading } =
    useCreateAccount();
  const { mutate: editTransaction, isPending: editTransactionLoading } =
    useEditTransaction(id);
  const { mutate: deleteTransaction, isPending: deleteTransactionLoading } =
    useDeleteTransaction(id);

  const { data: transaction, isLoading: transactionLoading } =
    useGetTransaction(id);
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { data: accounts, isLoading: accountsLoading } = useGetAccounts();

  const createCategoryHandler = (name: string) => createCategory({ name });
  const createAccountHandler = (name: string) => createAccount({ name });
  const submitHandler = (values: FormValues) =>
    editTransaction(values, {
      onSuccess: () => onClose(),
    });

  const deleteHandler = () => {
    deleteTransaction();
    onClose();
  };

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
    editTransactionLoading ||
    categoriesLoading ||
    accountsLoading ||
    transactionLoading ||
    deleteTransactionLoading;

  const isDisabled =
    createCategoryLoading ||
    createAccountLoading ||
    editTransactionLoading ||
    categoriesLoading ||
    accountsLoading ||
    transactionLoading ||
    deleteTransactionLoading ||
    isLoading;

  const defaultValues = transaction
    ? {
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        amount: transaction.amount.toString(),
        date: transaction.date ? new Date(transaction.date) : new Date(),
        payee: transaction.payee,
        notes: transaction.notes,
      }
    : {
        accountId: "",
        categoryId: "",
        amount: "",
        payee: "",
        date: new Date(),
        notes: "",
      };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>Edit an existing transaction.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <TransactionForm
            id={id}
            defaultValues={defaultValues}
            onSubmit={submitHandler}
            categoryOptions={categoryOptions}
            accountOptions={accountOptions}
            onCreateCategory={createCategoryHandler}
            onCreateAccount={createAccountHandler}
            disabled={isDisabled}
            isLoading={isLoading}
            onDelete={deleteHandler}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

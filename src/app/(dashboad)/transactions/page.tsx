"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { UploadButton } from "@/app/(dashboad)/transactions/upload-button";
import {
  TransactionsResponseType,
  transactionsColumns,
} from "@/app/(dashboad)/transactions/transactions-columns";
import { ImportCard } from "@/app/(dashboad)/transactions/import-card";
import { transactions as transactionsSchema } from "@/db/schema";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useConfirm } from "@/hooks/use-confirm";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

const TransactionsPage = () => {
  const { onOpen } = useNewTransaction((state) => ({
    onOpen: state.onOpen,
  }));
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [selectedUser, setSelectedUser] = useState<string | undefined | null>(
    null
  );
  const { data: transactions, isLoading } = useGetTransactions();
  const { mutate: bulkDeleteMutation, isPending: isBulkDeletePending } =
    useBulkDeleteTransactions();
  const { mutate: bulkCreateMutation, isPending: isBulkCreatePending } =
    useBulkCreateTransactions();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Are you sure you want to continue?",
    "You are about to add new transactions"
  );

  const handleDelete = (rows: Row<TransactionsResponseType>[]) =>
    bulkDeleteMutation({ ids: rows.map(({ original: { id } }) => id) });

  const handleUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setVariant(VARIANTS.IMPORT);

    const formattedResults = {
      ...results,
      data: results.data.filter((result) =>
        Object.values(result).some(Boolean)
      ),
    };

    setImportResults(formattedResults);
  };

  const handleCancelImport = () => {
    setVariant(VARIANTS.LIST);
    setImportResults(INITIAL_IMPORT_RESULTS);
    setSelectedUser(null);
  };

  const handleSelectUser = (user?: string) => setSelectedUser(user);

  const handleSubmitImport = async (
    values: (typeof transactionsSchema.$inferInsert)[]
  ) => {
    if (!selectedUser) {
      toast.error("Please select a user to continue.");
      return;
    }
    const confirmed = await confirm();

    if (!confirmed) return;

    const data = values.map((value) => ({
      ...value,
      accountId: selectedUser,
    }));

    bulkCreateMutation(data, {
      onSuccess: () => {
        handleCancelImport();
      },
    });
  };

  const isDisabled = isBulkDeletePending || isLoading || isBulkCreatePending;

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <ConfirmationDialog />
        <ImportCard
          data={importResults.data}
          onCancel={handleCancelImport}
          onSubmit={handleSubmitImport}
          onSelect={handleSelectUser}
        />
      </>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none rop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transactions Page
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button size="sm" onClick={onOpen} className="w-full lg:w-auto">
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={handleUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            isLoading={isLoading}
            disabled={isDisabled}
            onDelete={handleDelete}
            columns={transactionsColumns}
            data={transactions || []}
            filterKey="payee"
            deletePrefix="transactions"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;

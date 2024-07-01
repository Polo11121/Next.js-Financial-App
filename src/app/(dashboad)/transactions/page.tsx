"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import {
  TransactionsResponseType,
  transactionsColumns,
} from "@/app/(dashboad)/transactions/transactions-columns";

const TransactionsPage = () => {
  const { onOpen } = useNewTransaction((state) => ({
    onOpen: state.onOpen,
  }));
  const { data: transactions, isLoading } = useGetTransactions();
  const { mutate, isPending } = useBulkDeleteTransactions();

  const isDisabled = isPending || isLoading;

  const handleDelete = (rows: Row<TransactionsResponseType>[]) =>
    mutate({ ids: rows.map(({ original: { id } }) => id) });

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none rop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transactions Page
          </CardTitle>
          <Button size="sm" onClick={onOpen}>
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <DataTable
          isLoading={isLoading}
          disabled={isDisabled}
          onDelete={handleDelete}
          columns={transactionsColumns}
          data={transactions || []}
          filterKey="payee"
          deletePrefix="transactions"
        />
      </Card>
    </div>
  );
};

export default TransactionsPage;

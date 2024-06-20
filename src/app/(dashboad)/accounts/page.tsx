"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { Plus } from "lucide-react";
import {
  AccountsResponseType,
  columns,
} from "@/app/(dashboad)/accounts/columns";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-upload";
import { Row } from "@tanstack/react-table";

const AccountPage = () => {
  const { onOpen } = useNewAccount((state) => ({
    onOpen: state.onOpen,
  }));
  const { data: accounts, isLoading } = useGetAccounts();
  const { mutate, isPending } = useBulkDeleteAccounts();

  const isDisabled = isPending || isLoading;

  const handleDelete = (rows: Row<AccountsResponseType>[]) =>
    mutate({ ids: rows.map(({ original: { id } }) => id) });

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none rop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Accounts Page</CardTitle>
          <Button size="sm" onClick={onOpen} disabled={isDisabled}>
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <DataTable
          isLoading={isLoading}
          disabled={isDisabled}
          onDelete={handleDelete}
          columns={columns}
          data={accounts || []}
          filterKey="name"
        />
      </Card>
    </div>
  );
};

export default AccountPage;

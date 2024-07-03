import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportTable } from "@/app/(dashboad)/transactions/import-table";
import { convertAmountToMilUnits } from "@/lib/utils";
import { format, parse } from "date-fns";
import { Select } from "@/components/select";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

type ImportCardProps = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
  onSelect: (user?: string) => void;
};

const DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
const OUTPUT_FORMAT = "yyyy-MM-dd";
const REQUIRED_OPTIONS = ["amount", "date", "payee"];

type SelectedColumnsState = {
  [key: string]: string | null;
};

export const ImportCard = ({
  data,
  onCancel,
  onSubmit,
  onSelect,
}: ImportCardProps) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>(
    {}
  );
  const { data: accounts, isLoading } = useGetAccounts();
  const { mutate: createAccount, isPending } = useCreateAccount();

  const headers = data[0];
  const body = data.slice(1);
  const accountOptions = (accounts ?? []).map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const createAccountHandler = (name: string) => createAccount({ name });

  const handleTableHeaderSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    setSelectedColumns((prevState) => {
      const newSelectedColumns = { ...prevState };

      for (const [key, value] of Object.entries(newSelectedColumns)) {
        if (value === "skip") {
          newSelectedColumns[key] = null;
        }
      }

      newSelectedColumns[`column_${columnIndex}`] =
        value === "skip" ? null : value;

      return newSelectedColumns;
    });
  };

  const handleContinue = () => {
    const getColumnIndex = (column: string) => column.split("_")[1];

    const mappedData = {
      headers: headers.map((_header, index) => {
        const columnIndex = getColumnIndex(`column_${index}`);
        return selectedColumns[`column_${columnIndex}`] || null;
      }),
      body: body
        .map((row) => {
          const transformedRow = row.map((cell, index) => {
            const columnIndex = getColumnIndex(`column_${index}`);
            return selectedColumns[`column_${columnIndex}`] ? cell : null;
          });

          return transformedRow.every((cell) => cell === null)
            ? []
            : transformedRow;
        })
        .filter((row) => row.length > 0),
    };

    const arrayOfData = mappedData.body.map((row) => {
      return row.reduce((acc: any, cell, index) => {
        const header = mappedData.headers[index];

        if (header !== null) {
          acc[header] = cell;
        }

        return acc;
      }, {});
    });

    const formattedData = arrayOfData.map((row) => {
      return {
        ...row,
        date: format(parse(row.date, DATE_FORMAT, new Date()), OUTPUT_FORMAT),
        amount: convertAmountToMilUnits(parseFloat(row.amount)),
      };
    });

    onSubmit(formattedData);
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;
  const isDisabled = progress !== REQUIRED_OPTIONS.length;

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none rop-shadow-sm">
        <CardContent>
          <CardHeader className="gap-y- lg:flex-row lg:items-center lg:justify-between ">
            <CardTitle className="text-xl line-clamp-1">
              Import Transactions
            </CardTitle>
          </CardHeader>
          <div className="flex gap-y-2 flex-col lg:flex-row justify-between mb-4">
            <div className="lg:w-72">
              <Select
                disabled={isPending || isLoading}
                onCreate={createAccountHandler}
                onChange={onSelect}
                placeholder="Select an account"
                options={accountOptions}
              />
            </div>
            <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
              <Button size="sm" onClick={onCancel} className="w-full lg:w-auto">
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isDisabled}
                onClick={handleContinue}
                className="w-full lg:w-auto"
              >
                Continue ({progress}/{REQUIRED_OPTIONS.length})
              </Button>
            </div>
          </div>
          <ImportTable
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeaderSelectChange={handleTableHeaderSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

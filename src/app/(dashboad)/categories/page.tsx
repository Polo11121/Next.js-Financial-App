"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import {
  CategoriesResponseType,
  categoriesColumns,
} from "@/app/(dashboad)/categories/categoies-columns";

const CategoriesPage = () => {
  const { onOpen } = useNewCategory((state) => ({
    onOpen: state.onOpen,
  }));
  const { data: categories, isLoading } = useGetCategories();
  const { mutate, isPending } = useBulkDeleteCategories();

  const isDisabled = isPending || isLoading;

  const handleDelete = (rows: Row<CategoriesResponseType>[]) =>
    mutate({ ids: rows.map(({ original: { id } }) => id) });

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none rop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Categories Page
          </CardTitle>
          <Button size="sm" onClick={onOpen} disabled={isDisabled}>
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <DataTable
          isLoading={isLoading}
          disabled={isDisabled}
          onDelete={handleDelete}
          columns={categoriesColumns}
          deletePrefix="categories"
          data={categories || []}
          filterKey="name"
        />
      </Card>
    </div>
  );
};

export default CategoriesPage;

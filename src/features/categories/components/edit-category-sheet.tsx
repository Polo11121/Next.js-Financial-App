"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useConfirm } from "@/hooks/useConfirm";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { useGetCategory } from "@/features/categories/api/use-get-category";
import { useEditCategory } from "@/features/categories/api/use-edit-category";
import { useDeleteCategory } from "@/features/categories/api/use-delete-category";
import { CategoryForm } from "@/features/categories/components/category-form";
import { insertCategorySchema } from "@/db/schema";

const formSchema = insertCategorySchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditCategorySheet = () => {
  const { isOpen, onClose, id } = useOpenCategory((state) => ({
    isOpen: state.isOpen,
    onClose: state.onClose,
    id: state.id,
  }));
  const { data: category, isLoading } = useGetCategory(id);
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditCategory(id);
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteCategory(id);
  const [ConfirmationDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this category. This action cannot be undone."
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
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Edit an existing category to organize your transactions.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex justify-center items-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <CategoryForm
              id={id}
              onSubmit={submitHandler}
              onDelete={deleteHandler}
              disabled={isDisabled}
              defaultValues={category}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

"use client";

import { useEffect, useState } from "react";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { EditCategorySheet } from "@/features/categories/components/edit-account-sheet";
import { NewCategorySheet } from "@/features/categories/components/new-category-sheet";

export const SheetsProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? (
    <>
      <EditAccountSheet />
      <NewAccountSheet />
      <EditCategorySheet />
      <NewCategorySheet />
    </>
  ) : null;
};

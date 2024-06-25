import { create } from "zustand";

type NewCategoryState = {
  isOpen: boolean;
};

type NewCategoryActions = {
  onOpen: () => void;
  onClose: () => void;
};

export const useNewCategory = create<NewCategoryState & NewCategoryActions>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  })
);

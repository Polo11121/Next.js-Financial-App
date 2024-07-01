import { create } from "zustand";

type NewTransactionState = {
  isOpen: boolean;
};

type NewTransactionActions = {
  onOpen: () => void;
  onClose: () => void;
};

export const useNewTransaction = create<
  NewTransactionState & NewTransactionActions
>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

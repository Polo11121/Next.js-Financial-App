import { create } from "zustand";

type OpenTransactionState = {
  isOpen: boolean;
  id?: string;
};

type OpenTransactionActions = {
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useOpenTransaction = create<
  OpenTransactionState & OpenTransactionActions
>((set) => ({
  isOpen: false,
  id: undefined,
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: undefined }),
}));

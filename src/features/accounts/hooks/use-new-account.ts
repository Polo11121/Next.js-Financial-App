import { create } from "zustand";

type NewAccountState = {
  isOpen: boolean;
};

type NewAccountActions = {
  onOpen: () => void;
  onClose: () => void;
};

export const useNewAccount = create<NewAccountState & NewAccountActions>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  })
);

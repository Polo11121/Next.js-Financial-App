import { create } from "zustand";

type OpenAccountState = {
  isOpen: boolean;
  id?: string;
};

type OpenAccountActions = {
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useOpenAccount = create<OpenAccountState & OpenAccountActions>(
  (set) => ({
    isOpen: false,
    id: undefined,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined }),
  })
);

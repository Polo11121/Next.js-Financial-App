import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const convertAmountToMilUnits = (amount: number) =>
  Math.round(amount * 1000);

export const convertAmountFromMilUnits = (amount: number) => amount / 1000;

export const formatCurrency = (amount: number) =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

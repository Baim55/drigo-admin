import type { Customer } from "./customer";

export interface DebtorSummary extends Customer {
  totalDebt: number;
}

export type DebtType =
  | "Fine"
  | "Salik"
  | "Fuel"
  | "Cleaning"
  | "Damage"
  | "ExtraKm"
  | "ServiceFee"
  | "Manual";

export interface Debt {
  id: number;
  type: DebtType;
  description: string | null;
  amount: number;
  currency: string;
  isPaid: boolean;
  paidAt: string | null;
  rentalId: number | null;
  billedTo: string;
  attachments: unknown[];
  createdAt: string;
}

export interface UserDebtSummary {
  userId: string;
  totalDebt: number;
  currency: string;
  debts: Debt[];
}

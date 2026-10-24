import { apiClient } from "./client";
import type { MonthlyReportItem } from "../types/analytics";

export interface Statistics {
  revenue: { total: number; currency: string };
  rentals: {
    total: number;
    active: number;
    completed: number;
    totalDistanceKm: number;
  };
  fleet: {
    cars: number;
    active: number;
    rented: number;
    utilizationRate: number;
  };
  customers: { total: number; verified: number; withDebt: number };
  salik: { trips: number; total: number };
  enoc: { transactions: number; liters: number; total: number };
  fines: { total: number; billed: number };
  debt: { unpaid: number; debtors: number };
  reservations: { total: number; active: number };
  support: { open: number };
}

export interface SalikSummary {
  totalTrips: number;
  totalAmount: number;
  billedAmount: number;
  unbilledAmount: number;
  currency: string;
}

export interface EnocSummary {
  totalTransactions: number;
  totalLiters: number;
  totalAmount: number;
  currency: string;
}

export const getStatistics = () =>
  apiClient<Statistics>("/api/admin/reports/statistics");
export const getMonthDetail = (month: string) =>
  apiClient<MonthlyReportItem>(`/api/admin/reports/monthly/${month}`);
export const getSalikSummary = () =>
  apiClient<SalikSummary>("/api/admin/salik/summary");
export const getEnocSummary = () =>
  apiClient<EnocSummary>("/api/admin/enoc/summary");

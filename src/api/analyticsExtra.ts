import { apiClient } from "./client";

export interface Points<T> {
  days: number;
  points: T[];
}

export const getRevenueDaily = () =>
  apiClient<Points<{ date: string; revenue: number }>>(
    "/api/admin/analytics/revenue-daily",
  );

export const getDebtDaily = () =>
  apiClient<Points<{ date: string; added: number; collected: number }>>(
    "/api/admin/analytics/debt-daily",
  );

export const getUtilizationDaily = () =>
  apiClient<Points<{ date: string; utilization: number }>>(
    "/api/admin/analytics/utilization-daily",
  );

export const getFunnel = () =>
  apiClient<{ steps: { step: string; count: number }[] }>(
    "/api/admin/analytics/customer-funnel",
  );

export interface Demographics {
  total: number;
  gender: { gender: string; count: number }[];
  age: { range: string; count: number }[];
  platform: { platform: string; count: number }[];
}

export const getDemographics = () =>
  apiClient<Demographics>("/api/admin/analytics/demographics");

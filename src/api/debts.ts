import type { PaginatedResponse } from "../types/car";
import type { DebtorSummary, UserDebtSummary } from "../types/debt";
import { apiClient } from "./client";

export interface GetDebtorsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function getDebtors(params: GetDebtorsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);

  return apiClient<PaginatedResponse<DebtorSummary>>(
    `/api/admin/users/with-debt?${query.toString()}`,
  );
}

export function getUserDebts(userId: string) {
  return apiClient<UserDebtSummary>(`/api/admin/users/${userId}/debt`);
}

export function payAllDebts(userId: string) {
  return apiClient<{ success: boolean }>(
    `/api/admin/users/${userId}/debt/pay`,
    { method: "POST" },
  );
}

export function payDebt(userId: string, debtId: number) {
  return apiClient<unknown>(
    `/api/admin/users/${userId}/debt/${debtId}/pay`,
    { method: "POST" },
  );
}

export function splitDebt(userId: string, debtId: number, installments: number) {
  return apiClient<unknown>(
    `/api/admin/users/${userId}/debt/${debtId}/split`,
    {
      method: "POST",
      body: JSON.stringify({ installments }),
    },
  );
}
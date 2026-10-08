import type { Payment } from "../types/payment";
import { apiClient } from "./client";

export function getUserPayments(userId: string) {
  return apiClient<{ data: Payment[] }>(
    `/api/admin/users/${userId}/payments?pageSize=100`,
  ).then((res) => res.data);
}

export function retryPayment(userId: string, paymentId: number) {
  return apiClient<unknown>(
    `/api/admin/users/${userId}/payments/${paymentId}/retry`,
    { method: "POST" },
  );
}
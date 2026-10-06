import type { MonthlyReport } from "../types/analytics";
import { apiClient } from "./client";

export function getMonthlyReport(months: number = 6) {
  return apiClient<MonthlyReport>(`/api/admin/reports/monthly?months=${months}`);
}
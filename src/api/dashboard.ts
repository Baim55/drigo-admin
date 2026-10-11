import type { DashboardKpis, DashboardTrends } from "../types/dashboard";
import { apiClient } from "./client";

export function getKpis() {
  return apiClient<DashboardKpis>("/api/admin/dashboard/kpis");
}

export function getTrends() {
  return apiClient<DashboardTrends>("/api/admin/dashboard/trends");
}

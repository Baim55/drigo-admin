import type { DashboardKpis } from "../types/dashboard";
import { apiClient } from "./client";

export function getKpis() {
    return apiClient<DashboardKpis>("/api/admin/dashboard/kpis")
}
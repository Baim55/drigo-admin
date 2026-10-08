import type { GeoZone } from "../types/geozone";
import { apiClient } from "./client";

export function getGeoZones() {
  return apiClient<GeoZone[]>("/api/admin/geozones");
}

export function deleteGeoZone(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/geozones/${id}`, {
    method: "DELETE",
  });
}
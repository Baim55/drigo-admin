import type { GeoZone } from "../types/geozone";
import { apiClient } from "./client";

export function getGeoZones() {
  return apiClient<GeoZone[]>("/api/admin/geozones");
}

export function createGeoZone(data: any) {
  return apiClient<GeoZone>("/api/admin/geozones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateGeoZone(id: number, data: any) {
  return apiClient<GeoZone>(`/api/admin/geozones/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteGeoZone(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/geozones/${id}`, {
    method: "DELETE",
  });
}
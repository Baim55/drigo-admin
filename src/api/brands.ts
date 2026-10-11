import { apiClient } from "./client";

export interface Brand {
  id: number;
  name: string;
  isActive: boolean;
  carCount: number;
}

export interface BrandModel {
  id: number;
  brandId: number;
  name: string;
  seats: number;
  maxSpeed: number;
  bodyType: { id: number; name: string };
}

export interface BrandColor {
  id: number;
  brandId: number;
  name: string;
  code: string;
  hexCode: string;
}

export function getBrands() {
  return apiClient<{ data: Brand[] }>("/api/admin/brands");
}

export function getBrandModels(brandId: number) {
  return apiClient<BrandModel[]>(`/api/admin/brands/${brandId}/models`);
}

export function getBrandColors(brandId: number) {
  return apiClient<BrandColor[]>(`/api/admin/brands/${brandId}/colors`);
}

export function createBrand(name: string) {
  return apiClient<Brand>("/api/admin/brands", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function deleteBrand(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/brands/${id}`, {
    method: "DELETE",
  });
}

export function createBrandModel(
  brandId: number,
  data: { name: string; seats: number; maxSpeed: number },
) {
  return apiClient<unknown>(`/api/admin/brands/${brandId}/models`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createBrandColor(
  brandId: number,
  data: { name: string; hexCode: string },
) {
  return apiClient<unknown>(`/api/admin/brands/${brandId}/colors`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

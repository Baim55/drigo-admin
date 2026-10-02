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
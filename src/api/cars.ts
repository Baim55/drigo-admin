import type {
  PaginatedResponse,
  Car,
  CarDetail,
  CarTrackingItem,
  CarFeature,
} from "../types/car";
import { apiClient } from "./client";

export interface GetCarsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function getCars(params: GetCarsParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", String(params.search));
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));
  query.set("sortBy", params.sortBy ?? "id");
  query.set("sortOrder", params.sortOrder ?? "asc");
  return apiClient<PaginatedResponse<Car>>(
    `/api/admin/cars?${query.toString()}`,
  );
}

export function getCarById(id: number) {
  return apiClient<CarDetail>(`/api/admin/cars/${id}`);
}

export interface CreateCarPayload {
  brandId: number;
  modelId: number;
  colorId: number;
  manufactureYear: number;
  plateNumber: string;
  chassisNumber: string;
  imei: string;
  maxSpeed: number;
  seats: number;
  carFeatureIds?: number[];
}

export function createCar(data: CreateCarPayload) {
  return apiClient<CarDetail>("/api/admin/cars", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCar(id: number, data: Partial<CarDetail>) {
  return apiClient<CarDetail>(`/api/admin/cars/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCar(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/cars/${id}`, {
    method: "DELETE",
  });
}

export function toggleCarActive(id: number) {
  return apiClient<Car>(`/api/admin/cars/${id}/toggle-active`);
}

export function getCarsTracking() {
  return apiClient<CarTrackingItem[]>("/api/admin/cars/tracking");
}

export function getCarFeatures() {
  return apiClient<CarFeature[]>("/api/admin/cars/car-features");
}

export interface CarStatus {
  carId: number;
  engineOn: boolean;
  online: boolean;
  speed: number;
  fuelLevel: number;
  doorsLocked: boolean;
  latitude: number;
  longitude: number;
  heading: number;
  activeRentalId: number | null;
}

export interface CarLastActivity {
  carId: number;
  lastActivityAt: string;
  online: boolean;
  event: string;
}

export type CarCommand = "lock" | "unlock" | "engine_on" | "engine_off";

export interface SendCommandResult {
  success: boolean;
  command: string;
  acceptedAt: string;
}

export function getCarStatus(id: number) {
  return apiClient<CarStatus>(`/api/admin/cars/${id}/status`);
}

export function getCarLastActivity(id: number) {
  return apiClient<CarLastActivity>(`/api/admin/cars/${id}/last-activity`);
}

export function sendCarCommand(id: number, command: CarCommand) {
  return apiClient<SendCommandResult>(`/api/admin/cars/${id}/send-command`, {
    method: "POST",
    body: JSON.stringify({ command }),
  });
}

export interface ProblematicCar extends Car {
  issues: string[];
}

export function getProblematicCars() {
  return apiClient<ProblematicCar[]>("/api/admin/cars/problematic");
}

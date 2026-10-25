import { apiClient } from "./client";

export interface Cleaning {
  id: number;
  carId: number;
  plateNumber: string;
  carName: string;
  type: string;
  status: string;
  scheduledAt: string;
  assignedTo: string | null;
  cost: number;
  currency: string;
}

export interface CarService {
  id: number;
  carId: number;
  plateNumber: string;
  type: string;
  status: string;
  odometer: number;
  cost: number;
  currency: string;
  scheduledAt: string;
  completedAt: string | null;
}

export interface BusinessInquiry {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  fleetSize: number;
  message: string;
  status: string;
  createdAt: string;
}

const unwrap = <T>(p: Promise<{ data: T[] }>) => p.then((r) => r.data);

export const getCleanings = () =>
  unwrap(apiClient<{ data: Cleaning[] }>("/api/admin/cleanings?pageSize=100"));
export const cancelCleaning = (id: number) =>
  apiClient<unknown>(`/api/admin/cleanings/${id}/cancel`, { method: "PUT" });

export const getCarServices = () =>
  unwrap(
    apiClient<{ data: CarService[] }>("/api/admin/car-services?pageSize=100"),
  );
export const setCarServiceStatus = (id: number, status: string) =>
  apiClient<unknown>(`/api/admin/car-services/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const getInquiries = () =>
  unwrap(
    apiClient<{ data: BusinessInquiry[] }>(
      "/api/admin/businessinquiries?pageSize=100",
    ),
  );
export const setInquiryStatus = (id: number, status: string) =>
  apiClient<unknown>(`/api/admin/businessinquiries/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

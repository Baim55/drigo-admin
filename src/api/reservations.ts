import type { PaginatedResponse } from "../types/car";
import type { Reservation, ReservationStatus } from "../types/reservation";
import { apiClient } from "./client";

export interface GetReservationsParams {
  page?: number;
  pageSize?: number;
  status?: ReservationStatus;
}

export function getReservations(params: GetReservationsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);

  return apiClient<PaginatedResponse<Reservation>>(
    `/api/admin/reservations?${query.toString()}`,
  );
}

export function getReservationById(id: number) {
  return apiClient<Reservation>(`/api/admin/reservations/${id}`);
}

export function cancelReservation(id: number) {
  return apiClient<Reservation>(`/api/admin/reservations/${id}/cancel`, {
    method: "POST",
  });
}

export interface DeliveryDriver {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  status: "Online" | "Offline" | "Busy";
  isActive: boolean;
  currentLat: number | null;
  currentLng: number | null;
  zoneId: number | null;
  activeDeliveries: number;
  completedDeliveries: number;
  rating: number;
}

export function getDeliveryDrivers() {
  return apiClient<{ data: DeliveryDriver[] }>(
    "/api/admin/deliveryDrivers",
  ).then((res) => res.data);
}

export function assignDriver(reservationId: number, driverId: number) {
  return apiClient<Reservation>(
    `/api/admin/reservations/${reservationId}/assign-driver`,
    {
      method: "POST",
      body: JSON.stringify({ driverId }),
    },
  );
}

export interface ActiveDelivery {
  id: number;
  customerName: string;
  carName: string;
  plateNumber: string;
  status: string;
  scheduledDeliveryDate: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  driverId: number | null;
  driverName: string | null;
  driverLat: number | null;
  driverLng: number | null;
}

export function getActiveDeliveries() {
  return apiClient<ActiveDelivery[]>(
    "/api/admin/reservations/active-deliveries",
  );
}

export interface DriverPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
}

export function createDriver(data: DriverPayload) {
  return apiClient<unknown>("/api/admin/deliveryDrivers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDriver(id: number, data: Partial<DriverPayload>) {
  return apiClient<unknown>(`/api/admin/deliveryDrivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDriver(id: number) {
  return apiClient<unknown>(`/api/admin/deliveryDrivers/${id}`, {
    method: "DELETE",
  });
}

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
  name: string;
  status: "Online" | "Offline" | "Busy";
  phoneNumber: string;
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

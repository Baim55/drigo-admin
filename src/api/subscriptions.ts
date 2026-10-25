import { apiClient } from "./client";

export type BookingStatus =
  | "Pending"
  | "Active"
  | "Assigned"
  | "Completed"
  | "Cancelled";

export interface SubscriptionPlan {
  id: number;
  modelId: number;
  modelName: string;
  monthlyPrice: number;
  currency: string;
  includedKm: number;
  minMonths: number;
  isActive: boolean;
  createdAt: string;
}

export interface SubscriptionBooking {
  id: number;
  userId: string;
  customerName: string;
  modelId: number;
  modelName: string;
  carId: number | null;
  status: BookingStatus;
  months: number;
  monthlyPrice: number;
  currency: string;
  startDate: string;
  createdAt: string;
}

export const getPlans = () =>
  apiClient<SubscriptionPlan[]>("/api/admin/subscription-plans");

export const getBookings = () =>
  apiClient<{ data: SubscriptionBooking[] }>(
    "/api/admin/subscription-bookings?pageSize=100",
  ).then((r) => r.data);

export const updateBookingStatus = (id: number, status: BookingStatus) =>
  apiClient<unknown>(`/api/admin/subscription-bookings/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const assignBookingCar = (id: number, carId: number) =>
  apiClient<unknown>(`/api/admin/subscription-bookings/${id}/car`, {
    method: "PUT",
    body: JSON.stringify({ carId }),
  });

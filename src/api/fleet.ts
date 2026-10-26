import { apiClient } from "./client";

export interface FleetHealth {
  total: number;
  conditions: { condition: string; count: number }[];
  openProblemReports: number;
  openAccidents: number;
}
export interface FleetTarget {
  city: string;
  targetCars: number;
  currentCars: number;
}
export interface FleetPlan {
  updatedAt: string;
  targets: FleetTarget[];
}
export interface FleetMove {
  id: number;
  carId: number;
  plateNumber: string;
  fromCity: string;
  toCity: string;
  status: string;
  assignedTo: string | null;
  scheduledAt: string;
}
export interface Utilization {
  totalCars: number;
  activeCars: number;
  idleCars: number;
  utilizationRate: number;
  totalRevenue: number;
  totalDistance: number;
  avgRevenuePerCar: number;
  currency: string;
}
export interface ParkingZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isFree: boolean;
}
export interface GasStation {
  id: number;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
}

export const getFleetHealth = () =>
  apiClient<FleetHealth>("/api/admin/analytics/fleet-health");
export const getFleetPlan = () => apiClient<FleetPlan>("/api/admin/fleetplan");
export const saveFleetPlan = (
  targets: { city: string; targetCars: number }[],
) =>
  apiClient<unknown>("/api/admin/fleetplan", {
    method: "PUT",
    body: JSON.stringify({ targets }),
  });
export const getFleetMoves = () =>
  apiClient<FleetMove[]>("/api/admin/fleet-moves");
export const getUtilization = () =>
  apiClient<Utilization>("/api/admin/fleet-utilization/summary");
export const getParkingZones = () =>
  apiClient<ParkingZone[]>("/api/admin/parkingZones");
export const getGasStations = () =>
  apiClient<GasStation[]>("/api/admin/gasStations");

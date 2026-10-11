export interface GeoPoint {
  lat: number;
  lng: number;
}

export type GeoZoneType = "Operating" | "Restricted" | "NoParking" | "Premium";

export interface GeoZone {
  id: number;
  name: string;
  type: GeoZoneType;
  isActive: boolean;
  polygon: GeoPoint[];
  color: string;
  createdAt: string;
}
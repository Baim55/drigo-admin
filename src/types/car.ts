export interface Car {
  id: number;
  brandName: string;
  modelName: string;
  manufactureYear: number;
  colorName: string;
  colorHexCode: string;
  plateNumber: string;
  imei: string;
  fuelLevel: number;
  isActive: boolean;
  createdAt: string;
  activeRentalId: number | null;
  endTripAvailableCities: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CarLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}

export interface CarFeature {
  id: number;
  name: string;
  icon: string | null;
}

export interface CityRef {
  id: number;
  name: string;
}

export interface ParkingZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isFree: boolean;
  createdAt: string;
}

export interface GasStation {
  id: number;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface CarDetail {
  id: number;
  brandName: string;
  modelName: string;
  manufactureYear: number;
  colorName: string;
  bodyType: string;
  fuelTypeName: string;
  fuelLevel: number;
  fuelTankCapacity: number;
  transmission: number;
  seats: number;
  maxSpeed: number;
  hasCarplay: boolean;
  keylessEntry: boolean;
  freeParking: boolean;
  freeFuel: boolean;
  insurance: boolean;
  freeInsurance: boolean;
  location: CarLocation;
  locationMapUrl: string;
  isActive: boolean;
  isUsable: boolean;
  createdAt: string;
  imageUrl: string;
  price: number;
  distance: number;
  plateNumber: string;
  chassisNumber: string;
  imei: string;
  carFeatures: CarFeature[];
  endTripAvailableCities: CityRef[];
  includedParkingZones: ParkingZone[];
  includedGasStations: GasStation[];
}

export interface CarTrackingItem {
  id: number;
  plateNumber: string;
  brandName: string;
  modelName: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  engineOn: boolean;
  online: boolean;
  fuelLevel: number;
  activeRentalId: number | null;
  status: string;
  lastActivityAt: string;
}
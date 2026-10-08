export interface TripFeeSetting {
  amount: number;
  currency: string;
  isActive: boolean;
  updatedAt: string;
}

export interface ExcessKmChargeSetting {
  pricePerKm: number;
  currency: string;
  isActive: boolean;
  updatedAt: string;
}
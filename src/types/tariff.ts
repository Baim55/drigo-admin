export interface TariffCountry {
  id: number;
  name: string;
  code: string;
}

export interface TariffPackage {
  id: number;
  unitCount: number;
  timeUnit: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  countries: TariffCountry[];
}
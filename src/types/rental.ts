export interface RentalUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface RentalCar {
  id?: number;
  brandName?: string;
  modelName?: string;
  plateNumber?: string;
}

export interface RentalRoute {
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
}

export type RentalStatus =
  | "Active"
  | "Started"
  | "Completed"
  | "PaymentPending"
  | "Cancelled"
  | "Accident";

export interface Rental {
  id: number;
  user: RentalUser;
  car: RentalCar;
  route: RentalRoute;
  startDate: string;
  endDate: string | null;
  status: RentalStatus;
  totalPrice: number;
  totalDistance: number;
  discountAmount: number;
  hasTarsContract: boolean;
  userTotalDebt: number;
  nextPaymentTotal: number | null;
  tariffName: string;
  currentPeriod: number;
  totalPaid: number;
  extraKmAmount: number;
  extraKmDistance: number;
  debtPaidAmount: number;
}
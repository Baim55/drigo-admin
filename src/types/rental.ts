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

export interface RentalTariff {
  id: number;
  packageName: string;
  unitCount: number;
  timeUnit: string;
  activePrice: number;
  includedDistance: number;
}

export interface RentalInsurance {
  id: number;
  name: string;
  dailyPrice: number;
  deductible: number;
}

export interface RentalActionHistoryItem {
  id: number;
  action: string;
  at: string;
  by: string;
  note: string | null;
}

export interface RentalHistoryItem {
  id: number;
  status: RentalStatus;
  startDate: string;
  endDate: string | null;
  totalPrice: number;
}

export interface RentalDetail extends Rental {
  tariff: RentalTariff | null;
  insurance: RentalInsurance | null;
  freeTimeEnd: string | null;
  nextPaymentDue: string | null;
  lastPaymentAt: string | null;
  isPackageExpired: boolean;
  totalDebt: number;
  debts: unknown[];
  actionHistory: RentalActionHistoryItem[];
  userRentalHistory: RentalHistoryItem[];
  startPhotoUrls: string[];
  endPhotoUrls: string[];
  paymentRetryState: PaymentRetryState | null;
  cancelReason: string | null;
  hasAccident: boolean;
}

export interface PaymentRetryState {
  attempts: number;
  lastError: string;
  nextRetryAt: string | null;
  amountDue: number;
}
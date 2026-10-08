export interface MonthlyRevenue {
  rental: number;
  extraKm: number;
  total: number;
  currency: string;
}

export interface MonthlyRentalsCount {
  total: number;
  completed: number;
}

export interface MonthlySalik {
  trips: number;
  total: number;
  billed: number;
}

export interface MonthlyEnoc {
  transactions: number;
  liters: number;
  total: number;
}

export interface MonthlyFines {
  billed: number;
  billedTotal: number;
}

export interface MonthlyDebt {
  added: number;
  collected: number;
}

export interface MonthlyReportItem {
  month: string;
  revenue: MonthlyRevenue;
  rentals: MonthlyRentalsCount;
  salik: MonthlySalik;
  enoc: MonthlyEnoc;
  fines: MonthlyFines;
  debt: MonthlyDebt;
  operatingCost: number;
  netRevenue: number;
  failedPayments: number;
  newCustomers: number;
}

export interface MonthlyReportTotals {
  revenue: number;
  salik: number;
  enoc: number;
  enocLiters: number;
  finesBilled: number;
  debtCollected: number;
  netRevenue: number;
  currency: string;
}

export interface MonthlyReport {
  months: MonthlyReportItem[];
  totals: MonthlyReportTotals;
}

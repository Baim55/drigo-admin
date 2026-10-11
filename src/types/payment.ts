export interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: "Succeeded" | "Failed";
  transactionType: string;
  serviceFee: number;
  isFinalPayment: boolean;
  failureReason: string | null;
  periodStart: string;
  periodEnd: string | null;
  createdAt: string;
}
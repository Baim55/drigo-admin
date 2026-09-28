export type FineStatus = "Pending" | "Review" | "Billed" | "Dismissed";

export interface Fine {
  id: number;
  carId: number;
  plateNumber: string;
  rentalId: number | null;
  userId: string;
  type: string;
  source: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  fineDate: string;
  location: string;
  status: FineStatus;
  billedTo: string | null;
  note: string | null;
  attachments: unknown[];
  createdAt: string;
}
export type DiscountStatus = "Active" | "Scheduled" | "Expired" | "Paused";
export type DiscountType = "Percentage" | "FixedPrice" | "FixedAmount";

export interface Discount {
  id: number;
  name: string;
  type: DiscountType;
  value: number;
  status: DiscountStatus;
  targetAudience: string;
  scope: string;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}
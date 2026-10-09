export type AccidentStatus = "Reported" | "UnderReview" | "Resolved" | "Closed";
export type FaultParty = "Customer" | "ThirdParty" | "Unknown";

export interface Accident {
  id: number;
  rentalId: number;
  carId: number;
  userId: string;
  faultParty: FaultParty;
  status: AccidentStatus;
  description: string;
  estimatedCost: number;
  currency: string;
  location: string;
  accidentDate: string;
  photos: string[];
  createdAt: string;
}
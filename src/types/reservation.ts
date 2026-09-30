export type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "DriverAssigned"
  | "PickingUp"
  | "InDelivery"
  | "Delivered"
  | "Completed"
  | "Cancelled"
  | "Expired";

export interface DeliveryAddress {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  carName: string;
  plateNumber: string;
  status: ReservationStatus;
  reservationDate: string;
  scheduledDeliveryDate: string;
  isImmediate: boolean;
  totalPrice: number;
  deliveryAddress: string | DeliveryAddress;
  driverName: string | null;
  createdAt: string;
}

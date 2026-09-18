export interface DashboardKpis {
  totalMembers: number;
  totalCars: number;
  activeRentals: number;
  activeReservations: number;
  openSupportTickets: number;
  totalDeliveryDrivers: number;
  onlineDrivers: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  totalDebt: number;
  stripeMonthlyRevenue: number;
  stripeTotalRevenue: number;
  averageVerificationTimeHours: number;
  pendingVerificationCount: number;
  iosUsers: number;
  androidUsers: number;
  approvedMembers: number;
  totalDebtBreakdown: {
    customer: number;
    company: number;
  };
}

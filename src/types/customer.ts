export interface Customer {
  id: string;
  phoneNumber: string;
  phoneCountryCode: string;
  phoneNumberConfirmed: boolean;
  fullName: string;
  email: string | null;
  createdAt: string;
  userType: string;
  isVerified: boolean;
  isApproved: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  platform: string;
  isPassportRejected: boolean;
  isNationalIdRejected: boolean;
  isDriverLicenseRejected: boolean;
  isFaceRejected: boolean;
}
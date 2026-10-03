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

export interface DocumentOcr {
  number: string;
  expiryDate: string;
  fullName: string;
}

export interface DocumentDetail {
  documentType: string;
  status: string;
  isVerified: boolean;
  uploadedAt: string | null;
  verifiedAt: string | null;
  frontUrl: string | null;
  backUrl: string | null;
  rejectionReason: string | null;
  ocr: DocumentOcr | null;
}

export interface FaceVerifyDetail {
  isVerified: boolean;
  status: string;
  matchScore: number;
  selfieUrl: string | null;
  verifiedAt: string | null;
}

export interface ReferralDetail {
  code: string;
  referredByCode: string | null;
  referredCount: number;
  bonusEarned: number;
}

export interface CustomerDetail extends Customer {
  profilePhotoUrl: string | null;
  birthDate: string | null;
  gender: string | null;
  passportDetail: DocumentDetail | null;
  driverLicenseDetail: DocumentDetail | null;
  nationalIdentityDetail: DocumentDetail | null;
  faceVerifyDetail: FaceVerifyDetail | null;
  referralDetail: ReferralDetail | null;
  bonusBalance: number;
  deletedAt: string | null;
  deletedByName: string | null;
}

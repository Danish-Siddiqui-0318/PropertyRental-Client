/** Response shapes returned by the existing AD Property Rental backend. */

export type Role = "renter" | "owner" | "admin";

export type Profile = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: string;
};

export type PropertyPhoto = {
  PhotoID: number;
  PhotoURL: string;
  IsPrimary: boolean;
};

export type Property = {
  PropertyID: number;
  OwnerID: number;
  Title: string;
  Description: string | null;
  PropertyType: string;
  Address: string;
  City: string;
  Bedrooms: number | null;
  Bathrooms: number | null;
  MonthlyRent: number;
  Status: string;
  CreatedAt: string;
  photos: PropertyPhoto[];
  owner?: { UserID: number; Name: string };
};

export type Inquiry = {
  InquiryID: number;
  PropertyID: number;
  RenterID?: number;
  Message: string;
  Status: string;
  OwnerReply: string | null;
  CreatedAt: string;
  RepliedAt: string | null;
  PropertyTitle?: string;
  City?: string;
  RenterName?: string;
  RenterEmail?: string;
  RenterPhone?: string;
  OwnerName?: string;
  OwnerEmail?: string;
  OwnerPhone?: string;
};

export type Rental = {
  AgreementID: number;
  PropertyID: number;
  OwnerID: number;
  RenterID: number;
  StartDate: string;
  EndDate: string | null;
  MonthlyRent: number;
  SecurityDeposit: number | null;
  PaymentDueDay: number;
  Status: string;
  CreatedAt: string;
  PropertyTitle?: string;
  Address?: string;
  City?: string;
  OwnerName?: string;
  OwnerEmail?: string;
  OwnerPhone?: string;
  RenterName?: string;
  RenterEmail?: string;
  RenterPhone?: string;
};

export type Payment = {
  PaymentID: number;
  AgreementID: number;
  Amount: number;
  DueDate: string;
  PaymentType: string;
  Status: string;
  PaidAt: string | null;
  CreatedAt: string;
  PropertyTitle?: string;
  OwnerName?: string;
  RenterName?: string;
};

export type Transaction = {
  TransactionID: number;
  PaymentID: number;
  TransactionReference: string | null;
  Amount: number;
  PaymentMethod: string;
  Status: string;
  TransactionDate: string;
  FailureReason: string | null;
  CreatedAt: string;
  PropertyTitle?: string;
  PaymentStatus?: string;
  OwnerName?: string;
  RenterName?: string;
};

export type AdminUser = {
  UserID: number;
  Name: string;
  Email: string;
  Role: Role;
  Phone: string | null;
  CreatedAt: string;
};

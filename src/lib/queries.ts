import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "./api";
import type {
  AdminUser,
  Inquiry,
  Payment,
  Property,
  Rental,
  Transaction,
} from "./types";

/* ---------- public ---------- */

export const propertiesQuery = () =>
  queryOptions({
    queryKey: ["properties"],
    queryFn: () =>
      apiRequest<{ properties: Property[]; count: number }>("/properties").then(
        (r) => r.properties ?? [],
      ),
  });

export const propertyQuery = (id: number) =>
  queryOptions({
    queryKey: ["property", id],
    queryFn: () =>
      apiRequest<{ property: Property }>(`/properties/${id}`).then((r) => r.property),
  });

/* ---------- owner ---------- */

export const myPropertiesQuery = () =>
  queryOptions({
    queryKey: ["my-properties"],
    queryFn: () =>
      apiRequest<{ properties: Property[] }>("/properties/my-properties", {
        auth: true,
      }).then((r) => r.properties ?? []),
  });

export const ownerInquiriesQuery = () =>
  queryOptions({
    queryKey: ["owner-inquiries"],
    queryFn: () =>
      apiRequest<{ inquiries: Inquiry[] }>("/properties/owner/inquiries", {
        auth: true,
      }).then((r) => r.inquiries ?? []),
  });

export const renterInquiriesQuery = () =>
  queryOptions({
    queryKey: ["renter-inquiries"],
    queryFn: () =>
      apiRequest<{ inquiries: Inquiry[] }>("/properties/renter/inquiries", {
        auth: true,
      }).then((r) => r.inquiries ?? []),
    retry: false,
  });

export const ownerEarningsQuery = () =>
  queryOptions({
    queryKey: ["owner-earnings"],
    queryFn: () =>
      apiRequest<{ totalEarnings: number; transactions: Transaction[] }>(
        "/transactions/owner",
        { auth: true },
      ),
  });

/* ---------- rentals ---------- */

export const rentalsQuery = () =>
  queryOptions({
    queryKey: ["rentals"],
    queryFn: () =>
      apiRequest<{ rentals: Rental[] }>("/rentals", { auth: true }).then(
        (r) => r.rentals ?? [],
      ),
  });

export const rentalQuery = (id: number) =>
  queryOptions({
    queryKey: ["rental", id],
    queryFn: () =>
      apiRequest<{ rental: Rental }>(`/rentals/${id}`, { auth: true }).then((r) => r.rental),
  });

/* ---------- payments & transactions ---------- */

export const paymentsQuery = () =>
  queryOptions({
    queryKey: ["payments"],
    queryFn: () =>
      apiRequest<{ payments: Payment[] }>("/payments", { auth: true }).then(
        (r) => r.payments ?? [],
      ),
  });

export const paymentQuery = (id: number) =>
  queryOptions({
    queryKey: ["payment", id],
    queryFn: () =>
      apiRequest<{ payment: Payment }>(`/payments/${id}`, { auth: true }).then(
        (r) => r.payment,
      ),
  });

export const paymentHistoryQuery = (id: number) =>
  queryOptions({
    queryKey: ["payment-history", id],
    queryFn: () =>
      apiRequest<{ payment: Payment; transactions: Transaction[] }>(
        `/payments/${id}/history`,
        { auth: true },
      ),
  });

export const transactionsQuery = () =>
  queryOptions({
    queryKey: ["transactions"],
    queryFn: () =>
      apiRequest<{ transactions: Transaction[] }>("/transactions", { auth: true }).then(
        (r) => r.transactions ?? [],
      ),
  });

export const transactionQuery = (id: number) =>
  queryOptions({
    queryKey: ["transaction", id],
    queryFn: () =>
      apiRequest<{ transaction: Transaction }>(`/transactions/${id}`, { auth: true }).then(
        (r) => r.transaction,
      ),
  });

/* ---------- admin ---------- */

export const adminUsersQuery = () =>
  queryOptions({
    queryKey: ["admin", "users"],
    queryFn: () =>
      apiRequest<{ users: AdminUser[] }>("/admin/users", { auth: true }).then(
        (r) => r.users ?? [],
      ),
  });

export const adminUserQuery = (id: number) =>
  queryOptions({
    queryKey: ["admin", "user", id],
    queryFn: () =>
      apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, { auth: true }).then((r) => r.user),
  });

export const adminPropertiesQuery = () =>
  queryOptions({
    queryKey: ["admin", "properties"],
    queryFn: () =>
      apiRequest<{ properties: (Property & { OwnerName?: string; OwnerEmail?: string })[] }>(
        "/admin/properties",
        { auth: true },
      ).then((r) => r.properties ?? []),
  });

export const adminRentalsQuery = () =>
  queryOptions({
    queryKey: ["admin", "rentals"],
    queryFn: () =>
      apiRequest<{ rentals: Rental[] }>("/admin/rentals", { auth: true }).then(
        (r) => r.rentals ?? [],
      ),
  });

export const adminPaymentsQuery = () =>
  queryOptions({
    queryKey: ["admin", "payments"],
    queryFn: () =>
      apiRequest<{ payments: Payment[] }>("/admin/payments", { auth: true }).then(
        (r) => r.payments ?? [],
      ),
  });

export const adminTransactionsQuery = () =>
  queryOptions({
    queryKey: ["admin", "transactions"],
    queryFn: () =>
      apiRequest<{ transactions: Transaction[] }>("/admin/transactions", {
        auth: true,
      }).then((r) => r.transactions ?? []),
  });

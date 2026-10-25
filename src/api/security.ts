import { apiClient } from "./client";

export interface BlockedIp {
  entry: string;
  reason: string;
  blockedAt: string;
}
export interface BlockedCountry {
  countryCode: string;
  reason: string;
  blockedAt: string;
}
export interface SmsMode {
  mode: string;
  countries: string[];
  updatedAt: string;
}

export const getBlockedIps = () =>
  apiClient<BlockedIp[]>("/api/admin/security/blocked-ips");

export const blockIp = (entry: string, reason: string) =>
  apiClient<unknown>("/api/admin/security/block-ip", {
    method: "POST",
    body: JSON.stringify({ entry, reason }),
  });

export const unblockIp = (entry: string) =>
  apiClient<unknown>(
    `/api/admin/security/block-ip/${encodeURIComponent(entry)}`,
    { method: "DELETE" },
  );

export const getBlockedCountries = () =>
  apiClient<BlockedCountry[]>("/api/admin/security/blocked-country-codes");

export const blockCountry = (countryCode: string, reason: string) =>
  apiClient<unknown>("/api/admin/security/block-country-code", {
    method: "POST",
    body: JSON.stringify({ countryCode, reason }),
  });

export const unblockCountry = (code: string) =>
  apiClient<unknown>(
    `/api/admin/security/block-country-code/${encodeURIComponent(code)}`,
    {
      method: "DELETE",
    },
  );

export const getSmsMode = () =>
  apiClient<SmsMode>("/api/admin/security/sms-country-mode");

export const setSmsMode = (mode: string, countries: string[]) =>
  apiClient<unknown>("/api/admin/security/sms-country-mode", {
    method: "POST",
    body: JSON.stringify({ mode, countries }),
  });
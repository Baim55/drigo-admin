import { apiClient } from "./client";

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: string;
  targetUserId: string | null;
  channel: string;
  status: string;
  createdAt: string;
}

export type CampaignStatus =
  | "Draft"
  | "Scheduled"
  | "Sending"
  | "Sent"
  | "Cancelled";

export interface Campaign {
  id: number;
  title: string;
  body: string;
  status: CampaignStatus;
  targetAudience: string;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  openCount: number;
  createdAt: string;
}

export const getHistory = () =>
  apiClient<{ data: NotificationItem[] }>(
    "/api/admin/notifications/history?pageSize=50",
  ).then((r) => r.data);

export const getCampaigns = () =>
  apiClient<{ data: Campaign[] }>(
    "/api/admin/notifications/campaigns?pageSize=50",
  ).then((r) => r.data);

export const sendBroadcast = (title: string, body: string) =>
  apiClient<unknown>("/api/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });

export const createCampaign = (
  title: string,
  body: string,
  targetAudience: string,
) =>
  apiClient<unknown>("/api/admin/notifications/campaigns", {
    method: "POST",
    body: JSON.stringify({ title, body, targetAudience }),
  });

export const setCampaignStatus = (id: number, status: CampaignStatus) =>
  apiClient<unknown>(`/api/admin/notifications/campaigns/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const executeCampaign = (id: number) =>
  apiClient<unknown>(`/api/admin/notifications/campaigns/${id}/execute`, {
    method: "POST",
  });

export const deleteCampaign = (id: number) =>
  apiClient<unknown>(`/api/admin/notifications/campaigns/${id}`, {
    method: "DELETE",
  });

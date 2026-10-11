import { apiClient } from "./client";

export interface StoryItem {
  id: number;
  mediaType: string;
  mediaUrl: string;
  durationSec: number;
  viewCount: number;
}

export interface Story {
  id: number;
  title: string;
  status: string;
  targetAudience: string;
  items: StoryItem[];
  viewCount: number;
  createdAt: string;
}

export interface StoryPayload {
  title: string;
  status: string;
  targetAudience: string;
}

export function getStories() {
  return apiClient<Story[] | { data: Story[] }>("/api/admin/stories").then((res) =>
    Array.isArray(res) ? res : res.data
  );
}

export function createStory(d: StoryPayload) {
  return apiClient<unknown>("/api/admin/stories", { method: "POST", body: JSON.stringify(d) });
}

export function updateStory(id: number, d: Partial<StoryPayload>) {
  return apiClient<unknown>(`/api/admin/stories/${id}`, { method: "PUT", body: JSON.stringify(d) });
}

export function deleteStory(id: number) {
  return apiClient<unknown>(`/api/admin/stories/${id}`, { method: "DELETE" });
}
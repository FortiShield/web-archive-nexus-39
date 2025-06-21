const API_BASE_URL = "http://localhost:8000";

export interface Snapshot {
  timestamp: string;
  url: string;
  title?: string;
  status: "completed" | "processing" | "failed";
  size?: string;
}

export interface ArchiveResponse {
  domain: string;
  snapshots: Snapshot[];
  total: number;
}

export const archiveApi = {
  async getSnapshots(domain: string): Promise<ArchiveResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/archive/${encodeURIComponent(domain)}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      throw error;
    }
  },

  async getSnapshot(domain: string, timestamp: string): Promise<string> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/archive/${encodeURIComponent(domain)}/${timestamp}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
  },
};

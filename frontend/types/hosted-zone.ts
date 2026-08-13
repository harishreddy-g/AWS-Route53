export interface HostedZone {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  recordCount?: number;
}

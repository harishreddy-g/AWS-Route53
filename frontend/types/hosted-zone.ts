export interface HostedZone {
  id: number;
  userId: number;
  name: string;
  zoneType: 'public' | 'private';
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  recordCount?: number;
}

export interface HostedZone {
  id: string;
  name: string;
  type: 'Public' | 'Private';
  description?: string;
  recordCount: number;
  status: 'Published' | 'Active' | 'Pending';
  createdAt: string;
}

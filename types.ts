export enum NodeStatus {
  ACTIVE = 'Active',
  DELINQUENT = 'Delinquent',
  OFFLINE = 'Offline'
}

export enum NodeTier {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  POOR = 'Poor'
}

export interface PNode {
  pubkey: string;
  gossipAddress: string;
  version: string;
  status: NodeStatus;
  storageCapacityGB: number;
  storageUsedBytes: number;
  storageCommittedBytes: number;
  storageUsagePercent: number;
  uptimeSeconds: number;
  lastSeen: number;
  isPublic: boolean;
  rpcPort: number;
  healthScore: number;
  tier: NodeTier;
  location: string;
  coordinates: [number, number];
  earnedCredits: number;
  validatorName: string;
  diskType: 'NVMe' | 'SSD';
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  totalStoragePB: number;
  avgUptime: number;
  avgHealthScore: number;
  consensusVersion: string;
  storagePressure: number;
  totalCreditsEarned: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
}

export interface NetworkEvent {
  id: string;
  type: 'connect' | 'disconnect' | 'sync' | 'alert';
  message: string;
  timestamp: string;
  nodeId?: string;
}

export interface VersionDistribution {
  name: string;
  value: number;
  fill: string;
}
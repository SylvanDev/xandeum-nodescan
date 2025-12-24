import { PNode, NodeStatus, NodeTier, NetworkStats, ChartDataPoint, NetworkEvent, VersionDistribution } from '../types';

const CREDITS_ENDPOINT = 'https://podcredits.xandeum.network/api/pods-credits';

const resolveGeoFromIP = (ip: string): { coords: [number, number], loc: string } => {
  if (ip.startsWith('173.212') || ip.startsWith('161.97')) return { coords: [50.4786, 12.3705], loc: 'Falkenstein, DE' };
  if (ip.startsWith('207.244')) return { coords: [38.6270, -90.1994], loc: 'St. Louis, MO' };
  if (ip.startsWith('192.190')) return { coords: [40.7128, -74.0060], loc: 'New York, NY' };
  return { coords: [0, 0], loc: 'Unknown Region' };
};

export const fetchSolPrice = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    if (!response.ok) throw new Error("API Limit");
    const data = await response.json();
    return `$${data.solana.usd}`;
  } catch (e) {
    return "-"; 
  }
};

export const fetchPNodes = async (): Promise<PNode[]> => {
  let creditsMap: Record<string, number> = {};
  
  try {
    const res = await fetch(CREDITS_ENDPOINT);
    if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
            data.forEach((item: any) => {
                const key = item.pubkey || item.publicKey;
                const amt = item.amount || item.credits || 0;
                if(key) creditsMap[key] = amt;
            });
        } else {
            creditsMap = data;
        }
    }
  } catch (e) {
    console.warn("Credits API unreachable");
  }

  try {
    const res = await fetch('/api/proxy');
    
    if (!res.ok) {
        console.error("Vercel Proxy Error:", res.status);
        return [];
    }

    const rpcNodes = await res.json();

    if (!Array.isArray(rpcNodes)) return [];

    return rpcNodes.map((rpcData: any) => {
      const ip = rpcData.address ? rpcData.address.split(':')[0] : '0.0.0.0';
      const geo = resolveGeoFromIP(ip);
      const now = Date.now() / 1000;
      const lastSeen = rpcData.last_seen_timestamp || 0;
      const isOnline = (now - lastSeen) < 900; 
      
      const committed = rpcData.storage_committed || 0;
      const used = rpcData.storage_used || 0;

      return {
          pubkey: rpcData.pubkey,
          gossipAddress: rpcData.address,
          version: rpcData.version || 'Unknown',
          status: isOnline ? NodeStatus.ACTIVE : NodeStatus.OFFLINE,
          storageCapacityGB: committed / (1024 ** 3),
          storageUsedBytes: used,
          storageCommittedBytes: committed,
          storageUsagePercent: rpcData.storage_usage_percent || 0,
          uptimeSeconds: rpcData.uptime || 0,
          lastSeen: lastSeen * 1000,
          isPublic: rpcData.is_public,
          rpcPort: rpcData.rpc_port,
          healthScore: isOnline ? 98 : 20,
          tier: committed > 500000000 ? NodeTier.EXCELLENT : NodeTier.GOOD,
          location: geo.loc,
          coordinates: geo.coords,
          earnedCredits: creditsMap[rpcData.pubkey] || 0,
          validatorName: 'Validator',
          diskType: 'SSD'
      };
    });

  } catch (error) {
    console.error("Backend bridge failed:", error);
    return [];
  }
};

export const getNetworkStats = (nodes: PNode[]): NetworkStats => {
  if (nodes.length === 0) {
      return {
        totalNodes: 0, activeNodes: 0, totalStoragePB: 0, avgUptime: 0, 
        avgHealthScore: 0, consensusVersion: '-', storagePressure: 0, totalCreditsEarned: 0
      };
  }

  const active = nodes.filter(n => n.status === NodeStatus.ACTIVE).length;
  const totalUsedBytes = nodes.reduce((acc, curr) => acc + curr.storageUsedBytes, 0);
  const totalCommittedBytes = nodes.reduce((acc, curr) => acc + curr.storageCommittedBytes, 0);
  
  const totalStoragePB = parseFloat((totalUsedBytes / (1024**4)).toFixed(4)); 
  const totalCredits = nodes.reduce((acc, curr) => acc + (curr.earnedCredits || 0), 0);
  const healthSum = nodes.reduce((acc, curr) => acc + curr.healthScore, 0);
  const avgHealth = Math.round(healthSum / nodes.length);
  const pressure = totalCommittedBytes > 0 ? (totalUsedBytes / totalCommittedBytes) * 100 : 0;

  return {
    totalNodes: nodes.length,
    activeNodes: active,
    totalStoragePB: totalStoragePB,
    avgUptime: 99.9,
    avgHealthScore: avgHealth,
    consensusVersion: nodes[0]?.version || '-',
    storagePressure: parseFloat(pressure.toFixed(4)),
    totalCreditsEarned: Math.floor(totalCredits)
  };
};

export const generateNewEvent = (): NetworkEvent => {
    return {
        id: Math.random().toString(),
        type: 'sync',
        message: 'Monitoring Network...',
        timestamp: new Date().toLocaleTimeString()
    };
};

export const getHistoryData = (): ChartDataPoint[] => [];
export const getRecentEvents = (): NetworkEvent[] => [];
export const getVersionDistribution = (nodes: PNode[]): VersionDistribution[] => {
  if (nodes.length === 0) return [];
  const counts: Record<string, number> = {};
  nodes.forEach(n => {
    const v = n.version.split('-')[0] || 'Unknown';
    counts[v] = (counts[v] || 0) + 1;
  });
  const colors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'];
  return Object.entries(counts).map(([name, value], i) => ({
    name, value, fill: colors[i % colors.length] || '#888'
  }));
};
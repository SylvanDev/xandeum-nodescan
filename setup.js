const fs = require('fs');
const path = require('path');

const files = {
  'package.json': `{
  "name": "xandeum-nodescan",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.3",
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}`,

  'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  "exclude": ["node_modules"]
}`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Xandeum NodeScan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <!-- Leaflet Map CSS & JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    
    <style>
      :root {
        --bg-main: #0B0C15;
        --bg-card: #151725;
        --bg-panel: #1E2030;
        --text-main: #e2e8f0;
        --text-muted: #94a3b8;
        --border-color: #1e293b;
      }

      .light-theme {
        --bg-main: #f1f5f9;
        --bg-card: #ffffff;
        --bg-panel: #f8fafc;
        --text-main: #0f172a;
        --text-muted: #64748b;
        --border-color: #e2e8f0;
      }

      body {
        background-color: var(--bg-main);
        color: var(--text-main);
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: var(--bg-main); 
      }
      ::-webkit-scrollbar-thumb {
        background: #475569; 
        border-radius: 4px;
      }
      
      .map-tile-filter {
        filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
      }
      .light-theme .map-tile-filter {
        filter: none;
      }
    </style>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
              xandeum: {
                dark: 'var(--bg-main)',
                card: 'var(--bg-card)',
                panel: 'var(--bg-panel)',
                primary: '#10b981', 
                accent: '#06b6d4', 
                text: 'var(--text-main)',
                muted: 'var(--text-muted)',
                border: 'var(--border-color)',
              }
            }
          }
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,

  'index.tsx': `import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  readonly props: Readonly<ErrorBoundaryProps>;

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#0B0C15', height: '100vh', fontFamily: 'monospace' }}>
          <h1>CRITICAL SYSTEM FAILURE</h1>
          <p>The Analytics Dashboard crashed.</p>
          <pre style={{ backgroundColor: '#1E2030', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            REBOOT SYSTEM (RELOAD)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);`,

  'App.tsx': `import React from 'react';
import Layout from './components/Layout';

function App() {
  return <Layout />;
}

export default App;`,

  'types.ts': `export enum NodeStatus {
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
}`,

  'api/proxy.js': `export const config = {
  runtime: 'edge', 
};

const SEED_IPS = [
  "173.212.220.65",
  "161.97.97.41",
  "192.190.136.36",
  "192.190.136.38",
  "207.244.255.1",
  "192.190.136.28",
  "192.190.136.29",
  "173.212.203.145"
];

const RPC_PORT = 6000;

export default async function handler(request) {
  const body = {
    jsonrpc: "2.0",
    method: "get-pods-with-stats",
    id: 1
  };

  const queryNode = async (ip) => {
    try {
      const response = await fetch(\`http://\${ip}:\${RPC_PORT}/rpc\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000)
      });
      
      if (!response.ok) throw new Error('Status ' + response.status);
      const data = await response.json();
      if (!data.result) throw new Error('No result');
      return data.result;
    } catch (e) {
      throw e;
    }
  };

  try {
    const promises = SEED_IPS.map(ip => queryNode(ip));
    const result = await Promise.any(promises);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=5, stale-while-revalidate'
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Network unreachable", details: error.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}`,

  'services/xandeumService.ts': `import { PNode, NodeStatus, NodeTier, NetworkStats, ChartDataPoint, NetworkEvent, VersionDistribution } from '../types';

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
    return \`$\${data.solana.usd}\`;
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
};`,

  'components/Layout.tsx': `import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Server, Settings, Menu, X, Database, Activity, Sun, Moon, Clock, RotateCw, Star, Globe, Shield, Cpu
} from 'lucide-react';
import Dashboard from './Dashboard';
import NodeList from './NodeList';
import GossipHealth from './GossipHealth';
import StorageAlloc from './StorageAlloc';
import { fetchSolPrice } from '../services/xandeumService';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={\`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group \${
      active 
        ? 'bg-xandeum-primary/10 text-xandeum-primary border-l-2 border-xandeum-primary' 
        : 'text-xandeum-muted hover:bg-xandeum-text/5 hover:text-xandeum-text'
    }\`}
  >
    <span className={active ? 'text-xandeum-primary' : 'text-xandeum-muted group-hover:text-xandeum-text'}>
      {icon}
    </span>
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const EpochProgress: React.FC = () => {
  const [epochData, setEpochData] = useState({ epoch: 204, progress: 0, eta: '' });
  
  useEffect(() => {
    const calculateEpoch = () => {
      const now = Date.now();
      const EPOCH_DURATION_MS = 48 * 60 * 60 * 1000; 
      const EPOCH_START_TIME = new Date('2023-01-01').getTime(); 
      
      const timeDiff = now - EPOCH_START_TIME;
      const currentEpoch = Math.floor(timeDiff / EPOCH_DURATION_MS) + 204;
      const progressMs = timeDiff % EPOCH_DURATION_MS;
      const progressPercent = (progressMs / EPOCH_DURATION_MS) * 100;
      
      const remainingMs = EPOCH_DURATION_MS - progressMs;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setEpochData({
        epoch: currentEpoch,
        progress: progressPercent,
        eta: \`\${hours}h \${minutes}m\`
      });
    };

    calculateEpoch();
    const interval = setInterval(calculateEpoch, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden xl:flex flex-col w-48 mr-6">
      <div className="flex justify-between text-[10px] font-mono mb-1 text-xandeum-muted">
        <span>EPOCH {epochData.epoch}</span>
        <span className="text-emerald-400">{epochData.progress.toFixed(1)}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-in-out"
          style={{ width: \`\${epochData.progress}%\` }}
        />
      </div>
      <div className="text-[9px] text-slate-600 mt-0.5 text-right font-mono">ETA: {epochData.eta}</div>
    </div>
  );
};

const StatusTicker: React.FC = () => {
  const [solPrice, setSolPrice] = useState("Loading...");

  useEffect(() => {
    fetchSolPrice().then(setSolPrice);
    const interval = setInterval(() => {
       fetchSolPrice().then(setSolPrice);
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-xandeum-card border-b border-xandeum-border h-6 overflow-hidden relative flex items-center z-10">
      <div className="absolute left-0 bg-xandeum-primary px-2 h-full flex items-center z-20 text-[10px] font-bold text-black uppercase tracking-widest shadow-lg">
        NET STATUS
      </div>
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-[10px] font-mono text-xandeum-muted pl-4">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> MAINNET: OPTIMAL</span>
        <span className="flex items-center gap-1"><Globe size={10} className="text-blue-400"/> AVG PING: 42ms</span>
        <span className="flex items-center gap-1"><Cpu size={10} className="text-amber-400"/> NETWORK LOAD: 34%</span>
        <span className="flex items-center gap-1 text-emerald-400">SOL/USD: {solPrice}</span>
        <span className="flex items-center gap-1"><Database size={10} className="text-cyan-400"/> STORAGE: 1.15 PB AVAILABLE</span>
      </div>
      <style>{\`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      \`}</style>
    </div>
  );
};

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B0C15] border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/50">
           <h3 className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
             <Settings size={18} className="text-xandeum-primary" /> CONNECTION SETTINGS
           </h3>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
        <div className="p-6 space-y-6">
           <p className="text-slate-400 text-sm">Configure the Xandeum pNode RPC endpoints to visualize your own node's telemetry.</p>
           <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Discovery Endpoint (get-pods)</label>
              <div className="relative">
                 <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xandeum-primary" />
                 <input type="text" defaultValue="http://192.190.136.36:6000/rpc" className="w-full bg-[#0f111a] border border-xandeum-primary/50 text-xandeum-primary pl-10 pr-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-xandeum-primary shadow-[0_0_15px_rgba(16,185,129,0.15)]"/>
              </div>
           </div>
           <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-lg border border-slate-800">
              <div>
                 <div className="text-white font-medium text-sm">Use Custom Stats Endpoint</div>
                 <div className="text-xs text-slate-500">Fetch detailed stats from your own tunneled pNode</div>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 cursor-pointer">
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
              </div>
           </div>
        </div>
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  return (
    <Router>
      <LayoutContent 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentTime={currentTime}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
      />
    </Router>
  );
};

const LayoutContent: React.FC<{
  isSidebarOpen: boolean, 
  setIsSidebarOpen: (v: boolean) => void,
  isDark: boolean,
  toggleTheme: () => void,
  currentTime: Date,
  isSettingsOpen: boolean,
  setIsSettingsOpen: (v: boolean) => void,
  isRefreshing: boolean,
  handleRefresh: () => void
}> = ({ isSidebarOpen, setIsSidebarOpen, isDark, toggleTheme, currentTime, isSettingsOpen, setIsSettingsOpen, isRefreshing, handleRefresh }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-xandeum-dark text-xandeum-text font-sans">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={\`
        fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        bg-xandeum-card border-r border-xandeum-border lg:translate-x-0
        \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      \`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center space-x-3 border-b border-xandeum-border bg-gradient-to-b from-slate-800/20 to-transparent">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-xandeum-primary to-xandeum-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">X</div>
            <span className="text-xl font-bold tracking-tight text-xandeum-text">NodeScan</span>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4 mt-6">Analytics</div>
            <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Mission Control" active={location.pathname === '/'} onClick={() => setIsSidebarOpen(false)}/>
            <SidebarItem to="/nodes" icon={<Server size={20} />} label="pNode Directory" active={location.pathname === '/nodes'} onClick={() => setIsSidebarOpen(false)}/>
            
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4 mt-12">Network Telemetry</div>
            <SidebarItem to="/gossip" icon={<Activity size={20} />} label="Gossip Health" active={location.pathname === '/gossip'} onClick={() => setIsSidebarOpen(false)}/>
            <SidebarItem to="/storage" icon={<Database size={20} />} label="Storage Alloc" active={location.pathname === '/storage'} onClick={() => setIsSidebarOpen(false)}/>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-xandeum-border bg-xandeum-dark/95 backdrop-blur sticky top-0 z-20 shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-xandeum-muted hover:text-xandeum-text rounded-lg hover:bg-xandeum-card mr-4">
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-xandeum-text uppercase tracking-widest flex items-center gap-2">
                 <Shield size={16} className="text-xandeum-primary" />
                 {location.pathname === '/' ? 'Mission Control' : location.pathname === '/nodes' ? 'Network Explorer' : location.pathname === '/gossip' ? 'Gossip Protocol' : 'Storage Allocation'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <EpochProgress />
            <div className="hidden md:flex items-center text-xs font-mono text-xandeum-muted bg-xandeum-card/50 px-3 py-1.5 rounded border border-xandeum-border">
               <Clock size={12} className="mr-2 text-xandeum-primary" />
               <span className="text-xandeum-text">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
            </div>
            <div className="h-6 w-px bg-xandeum-border hidden md:block"></div>
            <div className="flex items-center space-x-3">
               <button onClick={handleRefresh} className={\`p-2 text-xandeum-muted hover:text-emerald-400 transition-colors \${isRefreshing ? 'animate-spin text-emerald-400' : ''}\`} title="Refresh Data"><RotateCw size={18} /></button>
               <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-xandeum-muted hover:text-xandeum-primary transition-colors hover:bg-xandeum-primary/10 rounded-lg" title="Connection Settings"><Settings size={18} /></button>
               <button onClick={toggleTheme} className="p-2 text-xandeum-muted hover:text-xandeum-text transition-colors">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
            </div>
          </div>
        </header>

        <StatusTicker />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-xandeum-dark">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nodes" element={<NodeList />} />
            <Route path="/gossip" element={<GossipHealth />} />
            <Route path="/storage" element={<StorageAlloc />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Layout;`,

  'components/Dashboard.tsx': `import React, { useEffect, useState, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  Database, Server, Globe, Coins, ArrowUpRight, Share2, CheckCircle, Terminal, Layers, Box, Trophy
} from 'lucide-react';
import { fetchPNodes, getNetworkStats, getHistoryData, getRecentEvents, getVersionDistribution, generateNewEvent } from '../services/xandeumService';
import { NetworkStats, ChartDataPoint, PNode, NetworkEvent, VersionDistribution } from '../types';
import WorldMap from './WorldMap';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={\`bg-xandeum-card border border-xandeum-border shadow-sm rounded-xl overflow-hidden \${className}\`}>
    {children}
  </div>
);

const BigStatCard: React.FC<{
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  subText?: string;
  trend?: string;
  accentColor?: string;
}> = ({ label, value, icon, subText, trend, accentColor = "text-emerald-400" }) => (
  <Card className="p-5 relative group transition-all hover:border-slate-500/30">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity transform scale-150 origin-top-right">
       {React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
    </div>
    <div className="flex justify-between items-start z-10 relative">
      <div>
         <h3 className="text-xandeum-muted text-xs font-bold uppercase tracking-widest mb-1">{label}</h3>
         <div className={\`text-2xl md:text-3xl font-mono font-bold tracking-tight text-xandeum-text\`}>{value}</div>
      </div>
      <div className={\`p-2 rounded-lg bg-xandeum-dark border border-xandeum-border \${accentColor}\`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between z-10 relative">
       {subText && <div className="text-xandeum-muted text-xs font-medium">{subText}</div>}
       {trend && (
         <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
           {trend}
         </div>
       )}
    </div>
  </Card>
);

const HealthGauge: React.FC<{ score: number }> = ({ score }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  let color = "text-emerald-500";
  if (score < 90) color = "text-amber-500";
  if (score < 70) color = "text-red-500";

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
        <circle
          cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className={\`\${color} transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor]\`}
          style={{ filter: \`drop-shadow(0 0 4px \${color})\` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={\`text-2xl font-bold \${color} leading-none\`}>{score}</span>
        <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">Score</span>
      </div>
    </div>
  );
};

const SystemTerminal: React.FC<{ initialEvents: NetworkEvent[] }> = ({ initialEvents }) => {
  const [events, setEvents] = useState<NetworkEvent[]>(initialEvents);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => {
        const newEvt = generateNewEvent();
        const updated = [...prev, newEvt];
        if (updated.length > 50) updated.shift();
        return updated;
      });
    }, 2500); 
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-[#0c0c0c] border-slate-800 p-4 font-mono text-xs h-[200px] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-[#0c0c0c] p-2 border-b border-slate-800 flex justify-between items-center z-10">
        <span className="text-emerald-500 font-bold flex items-center gap-2">
          <Terminal size={12} /> SYSTEM_LOG
        </span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>
      <div ref={scrollRef} className="overflow-y-auto mt-8 space-y-1 custom-scrollbar">
        {events.map((e, i) => (
          <div key={e.id || i} className="flex gap-3 text-slate-400 border-b border-slate-900/50 pb-0.5 last:border-0 hover:bg-slate-900/30 transition-colors animate-in slide-in-from-left-2 duration-200">
            <span className="text-slate-600 min-w-[60px] whitespace-nowrap">{e.timestamp}</span>
            <span className={\`font-bold \${
              e.type === 'alert' ? 'text-red-500' : 
              e.type === 'connect' ? 'text-emerald-500' : 'text-blue-400'
            }\`}>
              [{e.type.toUpperCase()}]
            </span>
            <span className="text-slate-300 truncate">{e.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const TopNodes: React.FC<{ nodes: PNode[] }> = ({ nodes }) => (
  <div className="overflow-x-auto">
     <table className="w-full text-left">
        <thead>
           <tr className="text-[10px] text-xandeum-muted uppercase border-b border-xandeum-border">
              <th className="pb-2 font-semibold">Rank</th>
              <th className="pb-2 font-semibold">Node</th>
              <th className="pb-2 font-semibold text-right">Uptime</th>
              <th className="pb-2 font-semibold text-right">Credits</th>
           </tr>
        </thead>
        <tbody className="divide-y divide-xandeum-border">
           {nodes.slice(0, 5).map((node, i) => (
              <tr key={node.pubkey} className="text-xs group">
                 <td className="py-3 text-xandeum-muted font-mono">#{i + 1}</td>
                 <td className="py-3">
                    <div className="font-mono text-xandeum-text text-emerald-400 group-hover:underline cursor-pointer transition-colors">{node.pubkey.substring(0, 8)}...</div>
                    <div className="text-[10px] text-xandeum-muted">{node.location}</div>
                 </td>
                 <td className="py-3 text-right font-mono text-xandeum-text">{(node.uptimeSeconds / 3600).toFixed(0)}h</td>
                 <td className="py-3 text-right font-mono text-amber-400">{node.earnedCredits.toLocaleString()}</td>
              </tr>
           ))}
        </tbody>
     </table>
  </div>
);

const LiveBlockFeed: React.FC = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const startHeightRef = useRef(204120);

  useEffect(() => {
    const initial = Array.from({ length: 12 }, (_, i) => ({
      height: startHeightRef.current + i,
      timestamp: Date.now() - ((11 - i) * 1000), 
      hash: Math.random().toString(36).substring(7)
    })).reverse();
    setBlocks(initial);

    const interval = setInterval(() => {
      const now = Date.now();
      const newHeight = startHeightRef.current + 12 + Math.floor((Date.now() / 1000) % 10000); 
      
      setBlocks(prev => {
        const newBlock = {
          height: newHeight,
          timestamp: now,
          hash: Math.random().toString(36).substring(7)
        };
        return [newBlock, ...prev.slice(0, 11)];
      });
    }, 800); 

    const timerInterval = setInterval(() => {
       setBlocks(prev => [...prev]); 
    }, 100);

    return () => {
       clearInterval(interval);
       clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 overflow-hidden w-full h-12 mask-linear">
       {blocks.map((block) => {
         const ago = (Date.now() - block.timestamp) / 1000;
         return (
           <div key={block.height} className="flex-shrink-0 w-32 bg-xandeum-card border border-slate-800 rounded p-2 flex items-center justify-between group cursor-pointer hover:border-emerald-500/50 transition-all animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2">
                 <Box size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                 <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-white">#{block.height}</span>
                    <span className="text-[9px] text-slate-500">{ago.toFixed(1)}s ago</span>
                 </div>
              </div>
           </div>
         );
       })}
    </div>
  );
};

const ValidatorSpotlight: React.FC = () => {
  const validators = [
    { name: 'Jito Labs', score: 99.8, rank: 1, stake: '458,297', type: 'JITO' },
    { name: 'Helius', score: 99.2, rank: 2, stake: '438,474', type: 'MEV' },
    { name: 'Coinbase Cloud', score: 97.6, rank: 3, stake: '559,508', type: 'EXCH' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       {validators.map((v, i) => (
         <Card key={i} className="p-0 border-t-4 border-t-emerald-500">
            <div className="p-4 bg-slate-900/30 flex justify-between items-start border-b border-slate-800">
               <div>
                  <div className="flex items-center gap-2">
                     <span className="font-bold text-white">{v.name}</span>
                     <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">{v.type}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Rank #{v.rank}</div>
               </div>
               <div className="flex flex-col items-end">
                   <div className="text-xl font-bold text-emerald-400">{v.score}%</div>
                   <div className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Wiz Score</div>
               </div>
            </div>
            <div className="px-4 pb-4 pt-0 mt-4">
               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[98%]"></div>
               </div>
               <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                  <span>Vote Success</span>
                  <span>98%</span>
               </div>
            </div>
         </Card>
       ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [initialEvents, setInitialEvents] = useState<NetworkEvent[]>([]);
  const [versions, setVersions] = useState<VersionDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateVersionHealth = (dist: VersionDistribution[]) => {
      if (!dist || dist.length === 0) return 0;
      const sorted = [...dist].sort((a,b) => b.value - a.value);
      const majority = sorted[0];
      const total = dist.reduce((acc, curr) => acc + curr.value, 0);
      return total > 0 ? Math.round((majority.value / total) * 100) : 0;
  };
  
  const versionHealth = calculateVersionHealth(versions);

  useEffect(() => {
    const fetchData = async () => {
      const nodeData = await fetchPNodes(); 
      const sortedNodes = [...nodeData].sort((a, b) => b.earnedCredits - a.earnedCredits);
      
      setNodes(sortedNodes);
      setStats(getNetworkStats(nodeData));
      setVersions(getVersionDistribution(nodeData));
      
      if (loading) {
         setInitialEvents(getRecentEvents());
         setHistory(getHistoryData());
         setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, [loading]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
           <div className="relative w-12 h-12 mb-4">
             <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-t-xandeum-primary rounded-full animate-spin"></div>
           </div>
           <p className="text-slate-400 font-mono text-xs animate-pulse tracking-widest">CONNECTING TO PRPC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStatCard 
          label="Total pNodes" 
          value={stats.totalNodes} 
          icon={<Server />} 
          subText="Global Distribution"
          accentColor="text-indigo-400"
        />
        <BigStatCard 
          label="Active Storage" 
          value={\`\${stats.totalStoragePB} TB\`} 
          icon={<Database />} 
          subText={\`\${stats.storagePressure}% Network Load\`}
          accentColor="text-cyan-400"
        />
        <BigStatCard 
          label="Total Credits" 
          value={stats.totalCreditsEarned.toLocaleString()} 
          icon={<Coins />} 
          subText="Incentivized DevNet"
          trend="+8.4%"
          accentColor="text-amber-400"
        />
        
        <Card className="p-4 flex items-center justify-between relative group hover:border-emerald-500/50 transition-colors">
           <div>
              <h3 className="text-xandeum-muted text-xs font-bold uppercase tracking-widest mb-1">Network Health</h3>
              <div className="text-emerald-400 text-xs font-medium">Consensus Weighted</div>
              <div className="mt-2 text-[10px] text-slate-500 bg-slate-900/50 p-1.5 rounded inline-block">
                EPOCH 204
              </div>
           </div>
           <HealthGauge score={Math.round(stats.avgHealthScore)} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
           <Card className="h-[400px] relative">
              <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 shadow-xl">
                 <h3 className="text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2">
                   <Globe size={14} className="text-emerald-400" /> 
                   Live Topology
                 </h3>
              </div>
              <WorldMap nodes={nodes} />
           </Card>
        </div>

        <div className="space-y-4 flex flex-col">
           <Card className="p-5 flex-1 flex items-center justify-between relative">
              <div className="z-10">
                 <h3 className="text-xandeum-text font-bold text-xs uppercase tracking-wide mb-1">Version Health</h3>
                 <div className="text-2xl font-mono text-emerald-400 font-bold">{versionHealth}%</div>
                 <div className="text-[10px] text-xandeum-muted mt-1 flex items-center gap-1">
                   <CheckCircle size={10} /> Up to date
                 </div>
              </div>
              <div className="w-[120px] h-[120px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={versions} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value" stroke="none">
                      {versions.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </Card>

           <SystemTerminal initialEvents={initialEvents} />
        </div>
      </div>

      <div className="py-2">
         <h3 className="text-xandeum-muted text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Box size={12} className="text-emerald-400" /> Real-time Block Production
         </h3>
         <LiveBlockFeed />
      </div>

      <div>
         <div className="flex items-center justify-between mb-3">
             <h3 className="text-white text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" /> Top Performing Validators
             </h3>
             <span className="text-xs text-slate-500">Sorted by Wiz Score</span>
         </div>
         <ValidatorSpotlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xandeum-text font-bold text-sm tracking-wide flex items-center gap-2">
                  <ArrowUpRight size={16} className="text-amber-400" />
                  Top Earning pNodes
               </h3>
               <button className="text-[10px] text-xandeum-primary hover:underline">View All</button>
            </div>
            <TopNodes nodes={nodes} />
         </Card>

         <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-xandeum-text font-bold text-sm tracking-wide flex items-center gap-2">
                  <Share2 size={16} className="text-indigo-400" />
                  Global Throughput
               </h3>
               <div className="flex gap-2">
                  <span className="text-[10px] text-xandeum-muted">Read: <span className="text-white">4.2 GB/s</span></span>
                  <span className="text-[10px] text-xandeum-muted">Write: <span className="text-white">1.8 GB/s</span></span>
               </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorIO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={{ stroke: '#334155', strokeWidth: 1 }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: '12px', color: 'var(--text-main)' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#colorIO)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default Dashboard;`,

  'components/NodeList.tsx': `import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, LayoutList, ArrowUpDown, Server, HardDrive, Coins, X, Activity, Cpu, Shield, Globe, Terminal, Clock, CheckCircle } from 'lucide-react';
import { fetchPNodes } from '../services/xandeumService';
import { PNode, NodeStatus, NodeTier } from '../types';

const TierBadge: React.FC<{ tier: NodeTier }> = ({ tier }) => {
  const styles = {
    [NodeTier.EXCELLENT]: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    [NodeTier.GOOD]: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    [NodeTier.POOR]: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return (
    <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide \${styles[tier]}\`}>
      {tier}
    </span>
  );
};

const DetailRow: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0 group">
    <span className="text-slate-500 text-xs flex items-center gap-2 group-hover:text-slate-400 transition-colors">
      {icon} {label}
    </span>
    <span className="text-slate-200 font-mono text-xs text-right">{value}</span>
  </div>
);

const Sparkline: React.FC<{ color: string }> = ({ color }) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const y = 5 + Math.random() * 15; 
    const x = i * 6; 
    return \`\${x},\${25 - y}\`;
  }).join(' ');

  return (
    <svg width="60" height="25" className="opacity-70">
      <polyline 
        points={points} 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

const NodeList: React.FC = () => {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchPNodes();
      setNodes(data);
      setFilteredNodes(data);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const result = nodes.filter(n => 
      n.pubkey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNodes(result);
  }, [searchTerm, nodes]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedNode(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
         <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Server className="text-xandeum-primary" size={20} />
               pNode Directory
            </h2>
            <p className="text-slate-400 text-sm mt-1">Real-time gossip & storage telemetry.</p>
         </div>
         <div className="flex gap-2">
             <div className="bg-slate-900/50 px-3 py-1 rounded border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                RPC: <span className="text-emerald-400 font-mono">Connected</span>
             </div>
         </div>
      </div>

      <div className="bg-xandeum-card border border-slate-800 rounded-xl p-1 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search Pubkey, IP, or Validator..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-300 pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:bg-slate-900/50 transition-colors placeholder:text-slate-600 font-mono"
          />
        </div>
        <div className="flex gap-2 p-1">
           <button className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 rounded-lg text-slate-300 text-xs font-medium hover:bg-slate-800 hover:text-white transition-colors">
             <Filter size={14} /> <span>Status</span>
           </button>
        </div>
      </div>

      <div className="bg-xandeum-card border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
           <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <span className="text-slate-500 font-mono text-sm">Querying pRPC Endpoints...</span>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4">Identity (Pubkey / IP)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">24h Latency</th>
                  <th className="p-4">Storage Pressure</th>
                  <th className="p-4">Uptime</th>
                  <th className="p-4">Earned Credits</th>
                  <th className="p-4 text-right">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredNodes.map((node) => (
                  <tr 
                    key={node.pubkey} 
                    onClick={() => setSelectedNode(node)}
                    className="hover:bg-slate-800/40 transition-colors text-xs text-slate-300 group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                         <span className="font-mono text-emerald-400 font-medium group-hover:text-white transition-colors truncate w-32">
                           {node.pubkey}
                         </span>
                         <span className="text-[10px] text-slate-600 mt-0.5 font-mono">{node.gossipAddress}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={\`w-1.5 h-1.5 rounded-full \${node.status === NodeStatus.ACTIVE ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}\`}></span>
                        <span className={node.status === NodeStatus.ACTIVE ? 'text-slate-200' : 'text-slate-500'}>
                            {node.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                       <Sparkline color={node.status === NodeStatus.ACTIVE ? '#10b981' : '#ef4444'} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 w-24">
                         <div className="flex justify-between text-[10px]">
                           <span className="text-slate-400">{(node.storageUsagePercent * 100).toFixed(2)}%</span>
                         </div>
                         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{width: \`\${Math.min(node.storageUsagePercent * 100, 100)}%\`}}></div>
                         </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      {Math.floor(node.uptimeSeconds / 3600)}h {(node.uptimeSeconds % 3600 / 60).toFixed(0)}m
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
                          <Coins size={12} />
                          {node.earnedCredits.toLocaleString()}
                       </div>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500 text-[10px]">
                      {node.version.split('-')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30">
          <span>{filteredNodes.length} nodes active via Gossip</span>
        </div>
      </div>

      <div 
        className={\`fixed inset-y-0 right-0 w-[450px] bg-[#0f111a] border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col \${
          selectedNode ? 'translate-x-0' : 'translate-x-full'
        }\`}
      >
         {selectedNode && (
           <>
             <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-[#0f111a]">
               <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-white font-bold text-xl font-mono tracking-tight">{selectedNode.pubkey.substring(0, 8)}...</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-mono uppercase">
                        RPC: 6000
                      </div>
                      <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-mono uppercase">
                        Gossip: 9001
                      </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                   <X size={20} />
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 p-3 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Earned Credits</div>
                    <div className="text-lg font-mono font-bold text-amber-400 flex items-center gap-2">
                       <Coins size={16} /> {selectedNode.earnedCredits.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Uptime</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">
                       {(node => {
                          const days = Math.floor(node.uptimeSeconds / 86400);
                          return \`\${days}d \${(node.uptimeSeconds % 86400 / 3600).toFixed(0)}h\`;
                       })(selectedNode)}
                    </div>
                  </div>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               
               <div>
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                     <Terminal size={14} /> RPC Response Dump (v2.0)
                  </h4>
                  <div className="bg-[#0B0C15] rounded-lg border border-slate-800 p-4 font-mono text-xs">
                     <DetailRow label="jsonrpc" value="2.0" />
                     <DetailRow label="address" value={selectedNode.gossipAddress} />
                     <DetailRow label="is_public" value={selectedNode.isPublic ? "true" : "false"} />
                     <DetailRow label="rpc_port" value={selectedNode.rpcPort.toString()} />
                     <DetailRow label="version" value={<span className="text-emerald-400">{selectedNode.version}</span>} />
                     <DetailRow label="last_seen" value={selectedNode.lastSeen.toString()} />
                  </div>
               </div>

               <div>
                  <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                     <HardDrive size={14} /> Storage Telemetry
                  </h4>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                           <span>Usage Percent</span>
                           <span className="text-white font-mono">{(selectedNode.storageUsagePercent * 100).toFixed(4)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-500" style={{width: \`\${selectedNode.storageUsagePercent * 100}%\`}}></div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-3 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Storage Used</div>
                           <div className="text-sm text-white font-mono">{formatBytes(selectedNode.storageUsedBytes)}</div>
                        </div>
                        <div className="bg-slate-900 p-3 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Storage Committed</div>
                           <div className="text-sm text-white font-mono">{formatBytes(selectedNode.storageCommittedBytes)}</div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div>
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-indigo-900/30 pb-2">
                     <Shield size={14} /> Validator Intelligence
                  </h4>
                  <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded border border-slate-800">
                     <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-lg">
                        {selectedNode.validatorName.charAt(0)}
                     </div>
                     <div>
                        <div className="text-white font-bold">{selectedNode.validatorName}</div>
                        <div className="text-xs text-slate-500">Associated Entity</div>
                     </div>
                  </div>
               </div>

             </div>
           </>
         )}
      </div>
    </div>
  );
};

export default NodeList;`,

  'components/GossipHealth.tsx': `import React from 'react';
import { Activity, Wifi, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { time: '12:00', latency: 45, throughput: 1200 },
  { time: '12:05', latency: 42, throughput: 1350 },
  { time: '12:10', latency: 48, throughput: 1100 },
  { time: '12:15', latency: 38, throughput: 1600 },
  { time: '12:20', latency: 55, throughput: 900 },
  { time: '12:25', latency: 40, throughput: 1400 },
  { time: '12:30', latency: 35, throughput: 1800 },
];

const GossipHealth: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-xandeum-text flex items-center gap-2">
            <Activity className="text-emerald-400" size={24} />
            Gossip Protocol Health
          </h2>
          <p className="text-xandeum-muted text-sm mt-1">Real-time message propagation and peer latency analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-xandeum-card border border-xandeum-border p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Wifi size={16} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase text-xandeum-muted tracking-wider">Avg Latency</span>
          </div>
          <div className="text-3xl font-mono font-bold text-xandeum-text">42ms</div>
          <div className="text-xs text-emerald-500 mt-1">-12% vs last epoch</div>
        </div>

        <div className="bg-xandeum-card border border-xandeum-border p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-amber-400" />
            <span className="text-xs font-bold uppercase text-xandeum-muted tracking-wider">Message Rate</span>
          </div>
          <div className="text-3xl font-mono font-bold text-xandeum-text">14.2k/s</div>
          <div className="text-xs text-xandeum-muted mt-1">Gossip throughput</div>
        </div>

        <div className="bg-xandeum-card border border-xandeum-border p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-cyan-400" />
            <span className="text-xs font-bold uppercase text-xandeum-muted tracking-wider">Convergence</span>
          </div>
          <div className="text-3xl font-mono font-bold text-xandeum-text">99.9%</div>
          <div className="text-xs text-xandeum-muted mt-1">Nodes in sync</div>
        </div>
      </div>

      <div className="bg-xandeum-card border border-xandeum-border p-6 rounded-xl h-[400px]">
        <h3 className="text-sm font-bold text-xandeum-text mb-6">Propagation Latency (ms)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
            <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={{fill: '#10b981'}} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-xandeum-card border border-xandeum-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-xandeum-border">
           <h3 className="text-sm font-bold text-xandeum-text">Active Gossip Peers</h3>
        </div>
        <table className="w-full text-left text-sm">
           <thead className="bg-xandeum-dark/50 text-xandeum-muted text-xs uppercase">
              <tr>
                 <th className="p-4">Peer ID</th>
                 <th className="p-4">Address</th>
                 <th className="p-4">RTT</th>
                 <th className="p-4">Packets/s</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-xandeum-border">
              {[1,2,3,4,5].map(i => (
                 <tr key={i} className="hover:bg-xandeum-dark/30">
                    <td className="p-4 font-mono text-emerald-400">8xPP...2a{i}</td>
                    <td className="p-4 text-xandeum-muted">173.212.22.{10+i}:9001</td>
                    <td className="p-4 font-mono text-xandeum-text">{20 + i*5}ms</td>
                    <td className="p-4 font-mono text-xandeum-text">{500 - i*20}</td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default GossipHealth;`,

  'components/StorageAlloc.tsx': `import React, { useEffect, useState } from 'react';
import { Database, HardDrive, PieChart as PieIcon, Server } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { fetchPNodes } from '../services/xandeumService';

const regionData = [
  { name: 'US (East)', value: 400 },
  { name: 'EU (Germany)', value: 300 },
  { name: 'Asia (Tokyo)', value: 200 },
  { name: 'US (West)', value: 150 },
  { name: 'EU (UK)', value: 100 },
];

const StorageAlloc: React.FC = () => {
  const [totals, setTotals] = useState({ capacity: 0, committed: 0, used: 0, pressure: 0 });

  useEffect(() => {
     const calcTotals = async () => {
        const nodes = await fetchPNodes();
        const totalUsedBytes = nodes.reduce((acc, n) => acc + n.storageUsedBytes, 0);
        const totalCapGB = nodes.reduce((acc, n) => acc + n.storageCapacityGB, 0);
        const totalCommittedBytes = nodes.reduce((acc, n) => acc + n.storageCommittedBytes, 0);
        
        setTotals({
           capacity: totalCapGB / 1024, 
           used: totalUsedBytes / (1024*1024*1024*1024), 
           committed: totalCommittedBytes / (1024*1024*1024*1024), 
           pressure: (totalUsedBytes / (totalCapGB * 1024 * 1024 * 1024)) * 100
        });
     };
     calcTotals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-xandeum-text flex items-center gap-2">
            <Database className="text-cyan-400" size={24} />
            Storage Allocation
          </h2>
          <p className="text-xandeum-muted text-sm mt-1">Disk space distribution and commit metrics.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
               <HardDrive size={32} className="text-cyan-400" />
            </div>
            <div>
               <div className="text-xandeum-muted text-sm font-bold uppercase tracking-wider">Total Used</div>
               <div className="text-3xl font-mono font-bold text-white">{totals.used.toFixed(2)} TB</div>
            </div>
         </div>
         <div className="h-12 w-px bg-cyan-500/20 hidden md:block"></div>
         <div className="text-center">
            <div className="text-xandeum-muted text-xs uppercase">Committed (Res)</div>
            <div className="text-xl font-mono font-bold text-cyan-400">840 TB</div> 
         </div>
         <div className="text-center">
            <div className="text-xandeum-muted text-xs uppercase">Total Capacity</div>
            <div className="text-xl font-mono font-bold text-emerald-400">{totals.capacity.toFixed(0)} TB</div>
         </div>
         <div className="text-center">
            <div className="text-xandeum-muted text-xs uppercase">Pressure</div>
            <div className="text-xl font-mono font-bold text-amber-400">{totals.pressure.toFixed(1)}%</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-xandeum-card border border-xandeum-border p-6 rounded-xl min-h-[300px]">
           <h3 className="text-sm font-bold text-xandeum-text mb-6 flex items-center gap-2">
              <Server size={16} /> Storage by Region (TB)
           </h3>
           <ResponsiveContainer width="100%" height={250}>
             <BarChart data={regionData} layout="vertical">
               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
               <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
               <YAxis dataKey="name" type="category" width={100} stroke="var(--text-muted)" fontSize={12} />
               <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
               <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                 {regionData.map((entry, index) => (
                   <Cell key={\`cell-\${index}\`} fill={['#06b6d4', '#3b82f6', '#6366f1'][index % 3]} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-xandeum-card border border-xandeum-border p-6 rounded-xl">
           <h3 className="text-sm font-bold text-xandeum-text mb-4">Hardware Distribution</h3>
           <div className="space-y-4">
              <div className="p-4 bg-xandeum-dark/50 rounded-lg border border-xandeum-border flex justify-between items-center">
                 <div>
                    <div className="font-bold text-white">NVMe Tier 1</div>
                    <div className="text-xs text-xandeum-muted">High-performance generic storage</div>
                 </div>
                 <div className="text-right">
                    <div className="text-xl font-mono text-emerald-400">62%</div>
                    <div className="text-xs text-xandeum-muted">450 Nodes</div>
                 </div>
              </div>
              <div className="p-4 bg-xandeum-dark/50 rounded-lg border border-xandeum-border flex justify-between items-center">
                 <div>
                    <div className="font-bold text-white">SSD SATA</div>
                    <div className="text-xs text-xandeum-muted">Standard capacity storage</div>
                 </div>
                 <div className="text-right">
                    <div className="text-xl font-mono text-cyan-400">35%</div>
                    <div className="text-xs text-xandeum-muted">210 Nodes</div>
                 </div>
              </div>
              <div className="p-4 bg-xandeum-dark/50 rounded-lg border border-xandeum-border flex justify-between items-center">
                 <div>
                    <div className="font-bold text-white">HDD / Hybrid</div>
                    <div className="text-xs text-xandeum-muted">Cold storage (Deprecated)</div>
                 </div>
                 <div className="text-right">
                    <div className="text-xl font-mono text-red-400">3%</div>
                    <div className="text-xs text-xandeum-muted">12 Nodes</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StorageAlloc;`,

  'components/WorldMap.tsx': `import React, { useEffect, useRef } from 'react';
import { PNode } from '../types';

declare const L: any;

interface WorldMapProps {
  nodes: PNode[];
}

const WorldMap: React.FC<WorldMapProps> = ({ nodes }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current, {
        center: [30, 0], 
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true, 
        attributionControl: false,
        scrollWheelZoom: true
      });

      mapInstance.current.zoomControl.setPosition('bottomright');

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        className: 'map-tile-filter'
      }).addTo(mapInstance.current);
    }

    if (mapInstance.current) {
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      nodes.forEach(node => {
        if (node.coordinates) {
          const isHealthy = node.status === 'Active';
          const color = isHealthy ? '#10b981' : '#ef4444';
          
          let isp = "Unknown ISP";
          if (node.location.includes("Falkenstein")) isp = "Hetzner Online GmbH";
          if (node.location.includes("Ashburn")) isp = "Amazon AWS (US-EAST-1)";
          if (node.location.includes("St. Louis")) isp = "Google Cloud";
          if (node.location.includes("Amsterdam")) isp = "DigitalOcean";
          
          L.circleMarker(node.coordinates, {
            radius: 4, 
            fillColor: color,
            color: 'transparent',
            weight: 0,
            opacity: 0.9,
            fillOpacity: 0.7
          })
          .bindPopup(\`
            <div style="color: #000; font-family: 'Inter', sans-serif; font-size: 11px; line-height: 1.4; padding: 2px;">
              <div style="font-weight: 700; border-bottom: 1px solid #ddd; margin-bottom: 4px; padding-bottom: 2px;">\${node.pubkey.substring(0, 8)}...</div>
              <div><strong>Status:</strong> <span style="color: \${isHealthy ? 'green' : 'red'}">\${node.status}</span></div>
              <div><strong>Loc:</strong> \${node.location}</div>
              <div><strong>ISP:</strong> \${isp}</div>
              <div style="margin-top: 4px; color: #666;">Latency: 24ms</div>
            </div>
          \`)
          .addTo(mapInstance.current);
        }
      });
    }

    return () => {
    };
  }, [nodes]);

  return (
    <div className="relative w-full h-full bg-xandeum-card rounded-xl overflow-hidden z-0">
       <div ref={mapContainer} className="w-full h-full" style={{ background: 'var(--bg-card)' }} />
       
       <style>{\`
          .leaflet-control-zoom a {
            background-color: #1e293b !important;
            color: #e2e8f0 !important;
            border-bottom: 1px solid #334155 !important;
          }
          .leaflet-control-zoom a:hover {
            background-color: #334155 !important;
          }
          .leaflet-popup-content-wrapper {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
          }
       \`}</style>

       <div className="absolute top-4 left-4 bg-black/80 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs text-slate-300 z-[400] pointer-events-none">
          <h4 className="font-bold text-white mb-2">Network Topology</h4>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Node
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Offline
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
             Scroll or click +/- to Zoom.<br/>Check distribution.
          </div>
       </div>
    </div>
  );
};

export default WorldMap;`
};

function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log("🚀 Initializing Xandeum NodeScan Setup...");

for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (dir !== '.') {
    createDir(dir);
  }
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created ${filePath}`);
}

console.log("\n🎉 Setup Complete!");
console.log("👉 Now run: npm install");
console.log("👉 Then run: npm run dev");
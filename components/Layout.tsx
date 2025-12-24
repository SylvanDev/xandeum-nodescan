import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Settings, 
  Menu, 
  X, 
  Database,
  Activity,
  Sun,
  Moon,
  Clock,
  RotateCw,
  Star,
  Globe,
  Shield,
  Cpu
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
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-xandeum-primary/10 text-xandeum-primary border-l-2 border-xandeum-primary' 
        : 'text-xandeum-muted hover:bg-xandeum-text/5 hover:text-xandeum-text'
    }`}
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
        eta: `${hours}h ${minutes}m`
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
          style={{ width: `${epochData.progress}%` }}
        />
      </div>
      <div className="text-[9px] text-slate-600 mt-0.5 text-right font-mono">ETA: {epochData.eta}</div>
    </div>
  );
};

// --- UPDATED TICKER: Uses real prices ---
const StatusTicker: React.FC = () => {
  const [solPrice, setSolPrice] = useState("Loading...");

  useEffect(() => {
    fetchSolPrice().then(setSolPrice);
    const interval = setInterval(() => {
       fetchSolPrice().then(setSolPrice);
    }, 60000); // Update price every minute
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
        
        {/* Duplicate */}
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> MAINNET: OPTIMAL</span>
        <span className="flex items-center gap-1"><Globe size={10} className="text-blue-400"/> AVG PING: 42ms</span>
        <span className="flex items-center gap-1"><Cpu size={10} className="text-amber-400"/> NETWORK LOAD: 34%</span>
        <span className="flex items-center gap-1 text-emerald-400">SOL/USD: {solPrice}</span>
      </div>
      <style>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
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

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        bg-xandeum-card border-r border-xandeum-border lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-xandeum-border bg-gradient-to-b from-slate-800/20 to-transparent">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-xandeum-primary to-xandeum-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">X</div>
              <span className="text-xl font-bold tracking-tight text-xandeum-text">NodeScan</span>
            </div>
            <div className="flex items-center gap-2 pl-1">
               <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">v1.0.3</span>
               <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4 mt-6">Analytics</div>
            <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Mission Control" active={location.pathname === '/'} onClick={() => setIsSidebarOpen(false)}/>
            <SidebarItem to="/nodes" icon={<Server size={20} />} label="pNode Directory" active={location.pathname === '/nodes'} onClick={() => setIsSidebarOpen(false)}/>
            <SidebarItem to="#" icon={<Star size={20} />} label="Watchlist" active={false} onClick={() => setIsSidebarOpen(false)}/>
            
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4 mt-12">Network Telemetry</div>
            <SidebarItem to="/gossip" icon={<Activity size={20} />} label="Gossip Health" active={location.pathname === '/gossip'} onClick={() => setIsSidebarOpen(false)}/>
            <SidebarItem to="/storage" icon={<Database size={20} />} label="Storage Alloc" active={location.pathname === '/storage'} onClick={() => setIsSidebarOpen(false)}/>
          </nav>

          <div className="p-4 border-t border-xandeum-border">
             <div className="bg-xandeum-dark/50 p-4 rounded-xl border border-xandeum-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-xs text-xandeum-muted mb-2 font-mono">NETWORK STATUS</p>
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">Mainnet Beta</span>
                </div>
             </div>
          </div>
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
               <button onClick={handleRefresh} className={`p-2 text-xandeum-muted hover:text-emerald-400 transition-colors ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} title="Refresh Data"><RotateCw size={18} /></button>
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

export default Layout;
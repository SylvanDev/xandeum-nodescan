import React, { useEffect, useState, useRef } from 'react';
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
  <div className={`bg-xandeum-card border border-xandeum-border shadow-sm rounded-xl overflow-hidden ${className}`}>
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
         <div className={`text-2xl md:text-3xl font-mono font-bold tracking-tight text-xandeum-text`}>{value}</div>
      </div>
      <div className={`p-2 rounded-lg bg-xandeum-dark border border-xandeum-border ${accentColor}`}>
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
          className={`${color} transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor]`}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color} leading-none`}>{score}</span>
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
            <span className={`font-bold ${
              e.type === 'alert' ? 'text-red-500' : 
              e.type === 'connect' ? 'text-emerald-500' : 'text-blue-400'
            }`}>
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
          value={`${stats.totalStoragePB} TB`} 
          icon={<Database />} 
          subText={`${stats.storagePressure}% Network Load`}
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
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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

export default Dashboard;
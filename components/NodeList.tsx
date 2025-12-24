import React, { useEffect, useState } from 'react';
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
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${styles[tier]}`}>
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
    return `${x},${25 - y}`;
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
                        <span className={`w-1.5 h-1.5 rounded-full ${node.status === NodeStatus.ACTIVE ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
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
                            <div className="h-full bg-cyan-500" style={{width: `${Math.min(node.storageUsagePercent * 100, 100)}%`}}></div>
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
        className={`fixed inset-y-0 right-0 w-[450px] bg-[#0f111a] border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          selectedNode ? 'translate-x-0' : 'translate-x-full'
        }`}
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
                          return `${days}d ${(node.uptimeSeconds % 86400 / 3600).toFixed(0)}h`;
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
                           <div className="h-full bg-cyan-500" style={{width: `${selectedNode.storageUsagePercent * 100}%`}}></div>
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

export default NodeList;
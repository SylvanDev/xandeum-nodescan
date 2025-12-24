import React, { useEffect, useState } from 'react';
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
                   <Cell key={`cell-${index}`} fill={['#06b6d4', '#3b82f6', '#6366f1'][index % 3]} />
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

export default StorageAlloc;
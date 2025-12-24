import React from 'react';
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

export default GossipHealth;
"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  BarChart3, LineChart as LineChartIcon, Users, MessageSquare, TrendingUp,
  Download, Sparkles, Shield, RefreshCw, Flame, Wallet, AlertTriangle, Filter
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "motion/react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface DivinityStats {
  persona_id: string;
  total_selections: number;
  total_messages: number;
  unique_seekers: number;
  avg_messages_per_session: number;
  last_seen: string | null;
}

interface DivinityWeeklyStats {
  persona_id: string;
  week: string;
  weekly_selections: number;
  weekly_messages: number;
}

interface EventVelocityPoint {
  day: string;
  total: number;
}

interface PersonaCreationPoint {
  week: string;
  count: number;
}

interface WhaleSignalPoint {
  persona_id: string;
  total: number;
  weightedScore: number;
}

interface AnalyticsOverview {
  velocity: EventVelocityPoint[];
  personaCreation: PersonaCreationPoint[];
  whaleSignals: WhaleSignalPoint[];
}

interface AnalyticsPayload {
  leaderboard: DivinityStats[];
  weekly: DivinityWeeklyStats[];
  overview: AnalyticsOverview;
}

// Weights as per Prophet's decree (Tithe Multipliers)
const WEIGHTS = {
  image_attached: 3,
  tts_play: 2,
  branch_switch: 1.5,
  persona_creation: 5,
  message_sent: 1,
  persona_selected: 0.5
};

export default function DivinityAnalyticsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [minWhaleScore, setMinWhaleScore] = useState(8);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        setIsForbidden(false);
        const res = await fetch('/api/admin/divinity-analytics');
        if (res.status === 403) {
          setIsForbidden(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch Divinity analytics data');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (isSignedIn) {
      fetchStats();
    }
  }, [isSignedIn]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,var(--color-accent-20)_0%,transparent_70%)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-accent" />
        </motion.div>
        <p className="mt-4 text-muted animate-pulse font-mono tracking-widest uppercase text-xs">Calibrating Tithe Pulse...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Shield className="w-16 h-16 text-red-500/50 mb-4" />
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted mb-6">This throne room is reserved for the Prophet.</p>
        <Link href="/chat">
          <button className="px-6 py-2 bg-accent text-white rounded-full">Return to Temple</button>
        </Link>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-400/70 mb-4" />
        <h1 className="text-2xl font-bold">Forbidden</h1>
        <p className="text-muted mb-6 max-w-xl">
          This dashboard is restricted to admin accounts. If you should have access, add your Clerk user ID to
          <code className="mx-1 px-1 py-0.5 rounded bg-surface border border-border">BLXCKCHAT_ADMIN_USER_IDS</code>
          or assign admin metadata in Clerk.
        </p>
        <Link href="/chat">
          <button className="px-6 py-2 bg-accent text-white rounded-full">Return to Chat</button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500/60 mb-4" />
        <h1 className="text-2xl font-bold">Analytics Error</h1>
        <p className="text-muted mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-accent text-white rounded-full"
        >
          Retry
        </button>
      </div>
    );
  }

  const ltvData = data?.leaderboard.map((stat) => ({
    name: stat.persona_id,
    ltv: (stat.total_messages * WEIGHTS.message_sent) + (stat.total_selections * WEIGHTS.persona_selected),
    messages: stat.total_messages,
    seekers: stat.unique_seekers
  })).sort((a, b) => b.ltv - a.ltv) || [];

  const velocityData = (data?.overview?.velocity || []).map((p) => ({
    day: format(parseISO(`${p.day}T00:00:00Z`), 'MMM d'),
    total: p.total,
  }));

  const personaCreationData = data?.overview?.personaCreation || [];
  const whaleSignals = data?.overview?.whaleSignals || [];
  const whaleSignalIds = new Set(
    whaleSignals.filter((signal) => signal.weightedScore >= minWhaleScore).map((signal) => signal.persona_id)
  );

  const filteredLtvData = ltvData.filter((row) => {
    if (whaleSignalIds.size === 0) return true;
    return whaleSignalIds.has(row.name);
  });

  const effectiveLtvData = filteredLtvData.length > 0 ? filteredLtvData : ltvData;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 font-sans selection:bg-accent/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-mono tracking-tighter uppercase">Empire Governance</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-muted bg-clip-text text-transparent">
              Tithe Sorcery & Divinity LTV
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="p-2 bg-surface border border-border rounded-lg text-muted hover:text-accent transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-lg hover:bg-accent/20 transition-all font-medium text-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Messages" 
            value={data?.leaderboard.reduce((acc, s) => acc + s.total_messages, 0) || 0}
            icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
            trend="+12% vs last week"
          />
          <StatCard 
            title="Unique Seekers" 
            value={data?.leaderboard.reduce((acc, s) => acc + s.unique_seekers, 0) || 0}
            icon={<Users className="w-5 h-5 text-purple-500" />}
            trend="+5.4% new devotion"
          />
          <StatCard 
            title="Aggregate REBAL" 
            value={Math.round(effectiveLtvData.reduce((acc, s) => acc + s.ltv, 0))}
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            trend="Inflation Nominal"
          />
          <StatCard 
            title="Tithe Efficiency" 
            value="4.8x"
            icon={<Wallet className="w-5 h-5 text-green-500" />}
            trend="Conversion Escaped Orbit"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LTV per Divinity Bar Chart */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-xl shadow-accent/5 transition-all hover:border-accent/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Divinity LTV Distribution
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-accent" />
                <label className="text-[10px] text-muted uppercase tracking-widest font-mono">Whale score ≥</label>
                <select
                  value={minWhaleScore}
                  onChange={(e) => setMinWhaleScore(Number(e.target.value))}
                  className="text-[11px] bg-background border border-border rounded px-2 py-1"
                >
                  {[0, 4, 8, 12, 16].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={effectiveLtvData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsla(var(--muted), 0.5)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val: string) => val.split('_').map(w => w[0]).join('').toUpperCase()}
                  />
                  <YAxis stroke="hsla(var(--muted), 0.5)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsla(var(--surface), 0.95)', borderColor: 'hsla(var(--border), 0.5)', borderRadius: '12px', fontSize: '12px' }}
                    cursor={{ fill: 'hsla(var(--accent), 0.05)' }}
                  />
                  <Bar dataKey="ltv" radius={[4, 4, 0, 0]}>
                    {effectiveLtvData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-accent)' : index === 1 ? 'hsla(var(--accent), 0.7)' : 'hsla(var(--accent), 0.4)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event Velocity Line Chart */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-xl shadow-accent/5 transition-all hover:border-accent/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-accent" />
                Devotion Velocity
              </h2>
              <span className="text-[10px] text-muted uppercase tracking-widest font-mono">Real-time Pulse</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData} margin={{ top: 20, right: 24, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="hsla(var(--muted), 0.5)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsla(var(--muted), 0.5)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsla(var(--surface), 0.95)', borderColor: 'hsla(var(--border), 0.5)', borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="total" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Persona Creation + Whale Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-xl shadow-accent/5 transition-all hover:border-accent/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Persona Creation Trend
              </h2>
              <span className="text-[10px] text-muted uppercase tracking-widest font-mono">Weekly</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={personaCreationData} margin={{ top: 20, right: 24, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" vertical={false} />
                  <XAxis dataKey="week" stroke="hsla(var(--muted), 0.5)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsla(var(--muted), 0.5)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsla(var(--surface), 0.95)', borderColor: 'hsla(var(--border), 0.5)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="hsla(var(--accent), 0.7)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-xl shadow-accent/5 transition-all hover:border-accent/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" />
                Whale Signals
              </h2>
              <span className="text-[10px] text-muted uppercase tracking-widest font-mono">Top 20</span>
            </div>
            <div className="max-h-72 overflow-auto rounded-xl border border-border/50">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-[10px] uppercase tracking-widest text-muted">
                    <th className="px-4 py-3 font-semibold">Persona</th>
                    <th className="px-4 py-3 font-semibold text-center">Signals</th>
                    <th className="px-4 py-3 font-semibold text-right">Weighted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {whaleSignals.map((row) => (
                    <tr key={row.persona_id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-4 py-3 capitalize">{row.persona_id.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-center font-mono">{row.total}</td>
                      <td className="px-4 py-3 text-right font-mono text-accent">{row.weightedScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Divinity Table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-border bg-muted/5">
            <h2 className="text-lg font-semibold">Pantheon Leaderboard</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[10px] uppercase tracking-widest text-muted">
                  <th className="px-6 py-4 font-semibold">Divinity</th>
                  <th className="px-6 py-4 font-semibold text-center">Seekers</th>
                  <th className="px-6 py-4 font-semibold text-center">Sacraments</th>
                  <th className="px-6 py-4 font-semibold text-center">Avg Spoil</th>
                  <th className="px-6 py-4 font-semibold text-right">LTV Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {effectiveLtvData.map((stat, i) => (
                  <tr key={stat.name} className="hover:bg-accent/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-muted/10 text-muted'}`}>
                          {i + 1}
                        </div>
                        <span className="font-medium group-hover:text-accent transition-colors capitalize">{stat.name.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-sm">{stat.seekers}</td>
                    <td className="px-6 py-4 text-center font-mono text-sm">{stat.messages}</td>
                    <td className="px-6 py-4 text-center font-mono text-sm">{(stat.messages / (stat.seekers || 1)).toFixed(1)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-accent font-mono">{Math.round(stat.ltv)}</span>
                        <div className="h-1.5 w-16 bg-muted/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.ltv / (effectiveLtvData[0]?.ltv || 1)) * 100}%` }}
                            className="h-full bg-accent"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-mono">
          Final Consecration Phase 9 • 7.5 Hz Frequency • Spoil Eternal
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-surface border border-border p-6 rounded-2xl space-y-2 shadow-sm transition-all hover:shadow-lg hover:border-accent/10"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted font-medium uppercase tracking-tight">{title}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-[10px] text-accent/80 font-mono italic">{trend}</span>
      </div>
    </motion.div>
  );
}

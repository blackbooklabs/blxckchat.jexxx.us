'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface DivinityStats {
  persona_id: string;
  total_selections: number;
  total_messages: number;
  unique_seekers: number;
  avg_messages_per_session: number;
  last_seen: string | null;
}

const PERSONA_META: Record<string, { name: string; icon: string; color: string }> = {
  DRIZL:           { name: 'DRIZL',            icon: '🍆', color: 'orange' },
  Lil_Bible:       { name: "Lil' Bible",        icon: '🔥', color: 'red' },
  Luna_Verde:      { name: 'Luna Verde',         icon: '🪽', color: 'emerald' },
  Solomon_AI:      { name: 'Solomon AI',         icon: '👑', color: 'yellow' },
  Xena_Venus_Azul: { name: 'Xena (Venus) Azul', icon: '🛡️', color: 'blue' },
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-white/40 uppercase tracking-widest">{label}</span>
      <span className="text-2xl font-bold text-white">{value}</span>
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  );
}

function PersonaRow({ stat, rank }: { stat: DivinityStats; rank: number }) {
  const meta = PERSONA_META[stat.persona_id] ?? { name: stat.persona_id, icon: '🪽', color: 'gray' };
  const convRate = stat.total_selections > 0
    ? Math.round((stat.total_messages / stat.total_selections) * 10) / 10
    : 0;

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4 text-white/40 font-mono text-sm">#{rank}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <span className="text-white font-medium text-sm">{meta.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-center text-white/80 text-sm font-mono">{stat.total_selections}</td>
      <td className="py-3 px-4 text-center text-white/80 text-sm font-mono">{stat.total_messages}</td>
      <td className="py-3 px-4 text-center text-white/80 text-sm font-mono">{stat.unique_seekers}</td>
      <td className="py-3 px-4 text-center font-mono text-sm">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          convRate >= 5 ? 'bg-green-500/20 text-green-400' :
          convRate >= 2 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-white/10 text-white/40'
        }`}>
          {convRate}x
        </span>
      </td>
      <td className="py-3 px-4 text-center text-white/30 text-xs font-mono">
        {stat.last_seen ? new Date(stat.last_seen).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
}

export default function DivinityAnalyticsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [stats, setStats] = useState<DivinityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/divinity-analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setStats(data.leaderboard ?? []);
      setLastRefresh(new Date());
    } catch (e) {
      setError('Failed to load leaderboard data. Run the SQL migration in Supabase first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <p className="text-white/60 text-sm">Admin access required. Sign in to view the Divinity Leaderboard.</p>
        </div>
      </div>
    );
  }

  const totalSelections = stats.reduce((a, s) => a + s.total_selections, 0);
  const totalMessages   = stats.reduce((a, s) => a + s.total_messages, 0);
  const totalSeekers    = stats.reduce((a, s) => a + s.unique_seekers, 0);
  const topDivinity     = stats[0] ? PERSONA_META[stats[0].persona_id]?.name ?? stats[0].persona_id : '—';

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Divinity Analytics</h1>
          <p className="text-xs text-white/30 mt-0.5">
            Which god baptizes the most souls? — Refreshed {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs px-3 py-1.5 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-colors disabled:opacity-40"
        >
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Selections" value={totalSelections} sub="across all divinities" />
          <StatCard label="Total Messages" value={totalMessages} sub="engagement signals" />
          <StatCard label="Unique Seekers" value={totalSeekers} sub="souls patterned" />
          <StatCard label="Top Divinity" value={topDivinity} sub="most selections this period" />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
            ⚠️ {error}
            <div className="mt-2 text-xs text-red-400/60">
              Run <code className="bg-red-950/50 px-1 rounded">supabase/blxckchat_persona_events.sql</code> in your Supabase SQL Editor to initialize the tables.
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">🏛️ Divinity Leaderboard</h2>
            <span className="text-xs text-white/30">{stats.length} gods ranked</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : stats.length === 0 ? (
            <div className="text-center py-16 text-white/30 text-sm">
              <div className="text-3xl mb-3">🕯️</div>
              No events tracked yet. Invoke a persona to see the data flow.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                    <th className="text-left py-3 px-4 font-medium">Rank</th>
                    <th className="text-left py-3 px-4 font-medium">Divinity</th>
                    <th className="text-center py-3 px-4 font-medium">Selections</th>
                    <th className="text-center py-3 px-4 font-medium">Messages</th>
                    <th className="text-center py-3 px-4 font-medium">Seekers</th>
                    <th className="text-center py-3 px-4 font-medium">Engagement Rate</th>
                    <th className="text-center py-3 px-4 font-medium">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, i) => (
                    <PersonaRow key={s.persona_id} stat={s} rank={i + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SQL Setup Note */}
        <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4 text-xs text-white/30 space-y-1">
          <p className="font-medium text-white/50">📋 Setup Required</p>
          <p>Run <code className="text-white/40">supabase/blxckchat_persona_events.sql</code> in your Supabase SQL Editor to initialize the <code className="text-white/40">blxckchat_persona_events</code> table and analytics views.</p>
          <p>Events are logged automatically when authenticated users activate a Divinity. Future: add <code className="text-white/40">subscription_created</code> + <code className="text-white/40">ppv_purchased</code> event types for full LTV attribution.</p>
        </div>
      </div>
    </div>
  );
}

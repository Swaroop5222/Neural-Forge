import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Users, FileText, ClipboardList, MessageSquare, Briefcase, 
  Percent, Clock, DollarSign, RefreshCw, AlertCircle, Sparkles, TrendingUp, Cpu, Activity, ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, aiData] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/analytics')
      ]);
      setStats(statsData.data || null);
      setAiStats(aiData.data || null);
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
      setError(err.message || 'Failed to retrieve dashboard stats. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-muted">
        <div className="text-center space-y-3">
          <RefreshCw className="spinner text-primary mx-auto" size={36} />
          <p className="text-sm font-semibold">Loading admin metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded cyber-card border border-[#FF4D6D]/30 bg-[#FF4D6D]/5 text-[#FF4D6D] text-xs font-mono flex gap-3 max-w-xl mx-auto my-12 relative">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <ShieldAlert size={24} className="flex-shrink-0 text-[#FF4D6D] animate-pulse" />
        <div>
          <h4 className="font-bold">Access Error</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;
  const activeUsers = stats?.activeUsers || 0;
  const newUsersThisWeek = stats?.newUsersThisWeek || 0;
  const resumeAnalysesCount = stats?.resumeAnalysesCount || 0;
  const mockInterviewsCount = stats?.mockInterviewsCount || 0;
  const quizAttemptsCount = stats?.quizAttemptsCount || 0;
  const jobSearchesCount = stats?.jobSearchesCount || 0;
  const averageAtsScore = stats?.averageAtsScore || 0;

  // Recharts line chart data
  const trendData = stats?.activityTrend && stats.activityTrend.length > 0
    ? stats.activityTrend.map(d => ({ name: d.day, count: d.count }))
    : [
        { name: 'Mon', count: 0 },
        { name: 'Tue', count: 0 },
        { name: 'Wed', count: 0 },
        { name: 'Thu', count: 0 },
        { name: 'Fri', count: 0 },
        { name: 'Sat', count: 0 },
        { name: 'Sun', count: 0 }
      ];

  const totalGemini = typeof aiStats?.totalGeminiRequests === 'number' ? aiStats.totalGeminiRequests : 0;
  const totalGroq = typeof aiStats?.totalGroqRequests === 'number' ? aiStats.totalGroqRequests : 0;
  const totalAiRequests = totalGemini + totalGroq;
  const successRate = typeof aiStats?.successRate === 'number' ? Number(aiStats.successRate.toFixed(1)) : 100;
  const failedAiRequests = typeof aiStats?.failedRequests === 'number' ? aiStats.failedRequests : 0;
  const averageLatency = typeof aiStats?.averageLatency === 'number' ? Math.round(aiStats.averageLatency) : 0;
  const estimatedCost = typeof aiStats?.estimatedCost === 'number' ? aiStats.estimatedCost : 0.0000;

  // Recharts donut chart data
  const modelPieData = [
    { name: 'Gemini', value: totalGemini, color: '#A855F7' },
    { name: 'Groq', value: totalGroq, color: '#00E5FF' }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Admin Overview</h1>
          <p className="text-text-muted text-sm mt-1">Real-time system statistics and usage analytics</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2.5 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <RefreshCw size={14} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">Total Accounts</span>
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/35 text-blue-400 flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.2)]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">{totalUsers}</h2>
            <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-[#00FF9D] uppercase tracking-wider">
              <TrendingUp size={12} />
              <span className="font-bold">+{newUsersThisWeek}</span>
              <span className="text-text-muted">registered this week</span>
            </div>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">Active Users (30d)</span>
            <div className="w-8 h-8 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/35 text-[#00FF9D] flex items-center justify-center shadow-[0_0_8px_rgba(0,255,157,0.2)]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">{activeUsers}</h2>
            <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wider">
              Uptime active: <strong className="text-[#00FFF0]">{totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%</strong>
            </p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">ATS Match Scans</span>
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">{resumeAnalysesCount}</h2>
            <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wider">
              Avg Match score: <strong className="text-[#00FFF0]">{averageAtsScore}%</strong>
            </p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">Mock Interviews</span>
            <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/35 text-purple-400 flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.2)]">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">{mockInterviewsCount}</h2>
            <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wider">Total practice runs logged</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 2 (AI Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">AI Queries (Gemini+Groq)</span>
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/35 text-[#00FFF0] flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.2)]">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">{totalAiRequests}</h2>
            <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wider">Gemini: {totalGemini} | Groq: {totalGroq}</p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">LLM Success SLA</span>
            <div className="w-8 h-8 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/35 text-[#00FF9D] flex items-center justify-center shadow-[0_0_8px_rgba(0,255,157,0.2)]">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">{successRate}%</h2>
            <p className="text-[9px] font-mono text-[#FF4D6D] mt-1 uppercase tracking-wider">{failedAiRequests} outages logged</p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">Average Latency</span>
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">{averageLatency} ms</h2>
            <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wider">API round-trip response time</p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted">Estimated LLM Cost</span>
            <div className="w-8 h-8 rounded bg-[#FF2E9A]/10 border border-[#FF2E9A]/35 text-[#FF2E9A] flex items-center justify-center shadow-[0_0_8px_rgba(255,46,154,0.2)]">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-black text-text-main tracking-wider">${estimatedCost.toFixed(4)}</h2>
            <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wider">Calculated from token weightings</p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Engagement Area Chart */}
        <div className="lg:col-span-8 p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 relative space-y-4">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <h3 className="font-heading font-bold text-xs text-[#00FFF0] uppercase tracking-widest">System Engagement Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminChartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} fontClassName="font-mono" />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} fontClassName="font-mono" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0f21', 
                    borderColor: 'rgba(0, 240, 240, 0.2)', 
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    fontFamily: 'Space Grotesk, sans-serif'
                  }} 
                />
                <Area type="monotone" dataKey="count" name="Activities" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#adminChartGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Provider Pie Chart */}
        <div className="lg:col-span-4 p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 relative flex flex-col justify-between">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <h3 className="font-heading font-bold text-xs text-[#00FFF0] uppercase tracking-widest">AI Models Used</h3>
          
          <div className="h-44 w-full flex items-center justify-center relative">
            {totalAiRequests === 0 ? (
              <p className="text-[10px] font-mono text-text-muted italic uppercase tracking-wider">No AI requests logged.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {modelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a0f21', 
                      borderColor: 'rgba(0, 240, 240, 0.2)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      fontFamily: 'Space Grotesk, sans-serif'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            <div className="absolute flex flex-col items-center justify-center font-mono">
              <span className="text-xl font-heading font-black text-text-main leading-none">{totalAiRequests}</span>
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1">Requests</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 pt-4 border-t border-border-dark text-xs text-text-muted font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              <span>Gemini ({totalGemini})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
              <span>Groq ({totalGroq})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Module Metrics */}
      <div className="cyber-card border border-[#00FFF0]/15 overflow-hidden">
        <div className="p-4 border-b border-[#00FFF0]/15 bg-[#0b1120]/80">
          <h3 className="font-heading font-bold text-xs text-[#00FFF0] uppercase tracking-widest">Interactive Modules Usage</h3>
        </div>
        <div className="overflow-x-auto w-full bg-[#050816]/75">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#0b1120]/40 border-b border-[#00FFF0]/15 text-text-muted font-bold text-[9px] uppercase tracking-widest">
                <th className="p-4">Module / Activity Type</th>
                <th className="p-4">Global Run Metric</th>
                <th className="p-4">Service Status Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00FFF0]/10 text-text-main">
              <tr className="hover:bg-[#0b1120]/40">
                <td className="p-4 font-semibold text-text-main">Job Searches Run</td>
                <td className="p-4">{jobSearchesCount} searches recorded</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase tracking-widest bg-[#00FF9D]/15 border border-[#00FF9D]/20 text-[#00FF9D]">
                    Healthy
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0b1120]/40">
                <td className="p-4 font-semibold text-text-main">Quiz Attempts Saved</td>
                <td className="p-4">{quizAttemptsCount} completions logged</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase tracking-widest bg-[#00FF9D]/15 border border-[#00FF9D]/20 text-[#00FF9D]">
                    Healthy
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0b1120]/40">
                <td className="p-4 font-semibold text-text-main">Resume Tailor Requests</td>
                <td className="p-4">All tailoring requests saved in reports</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase tracking-widest bg-[#00FF9D]/15 border border-[#00FF9D]/20 text-[#00FF9D]">
                    Healthy
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

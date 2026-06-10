import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Sparkles, Percent, Clock, DollarSign, RefreshCw, 
  AlertTriangle, CheckCircle, HelpCircle, FileSpreadsheet, FileText, Cpu, Layers
} from 'lucide-react';

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/analytics');
      setMetrics(res.data || null);
    } catch (err) {
      console.error('Error fetching AI analytics:', err);
      setError(err.message || 'Failed to retrieve AI Analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-muted">
        <div className="text-center space-y-3">
          <RefreshCw className="spinner text-primary mx-auto" size={36} />
          <p className="text-sm font-semibold">Loading AI analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded cyber-card border border-[#FF4D6D]/30 bg-[#FF4D6D]/5 text-[#FF4D6D] text-xs font-mono flex gap-3 max-w-xl mx-auto my-12 relative">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <AlertTriangle size={24} className="flex-shrink-0 text-[#FF4D6D] animate-pulse" />
        <div>
          <h4 className="font-bold">Telemetry Error</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const totalGemini = typeof metrics?.totalGeminiRequests === 'number' ? metrics.totalGeminiRequests : 0;
  const totalGroq = typeof metrics?.totalGroqRequests === 'number' ? metrics.totalGroqRequests : 0;
  const totalRequests = totalGemini + totalGroq;
  const successRate = typeof metrics?.successRate === 'number' ? Number(metrics.successRate.toFixed(1)) : 100;
  const failedRequests = typeof metrics?.failedRequests === 'number' ? metrics.failedRequests : 0;
  const averageLatency = typeof metrics?.averageLatency === 'number' ? Math.round(metrics.averageLatency) : 0;
  const estimatedCost = typeof metrics?.estimatedCost === 'number' ? metrics.estimatedCost : 0.00000;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">AI Analytics Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Usage counts, provider distribution, SLA success, latencies, and token costs</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2.5 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <RefreshCw size={14} />
          <span>Sync Logs</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex items-center gap-5">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="w-12 h-12 rounded bg-purple-500/10 border border-purple-500/35 text-purple-400 flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.2)]">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div className="font-mono">
            <p className="text-2xl font-heading font-black text-text-main tracking-wider">{totalGemini}</p>
            <p className="text-xs font-medium text-text-muted mt-0.5">Gemini Requests</p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex items-center gap-5">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="w-12 h-12 rounded bg-cyan/10 border border-cyan/35 text-[#00FFF0] flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.2)]">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div className="font-mono">
            <p className="text-2xl font-heading font-black text-text-main tracking-wider">{totalGroq}</p>
            <p className="text-xs font-medium text-text-muted mt-0.5">Groq Requests</p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex items-center gap-5">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="w-12 h-12 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/35 text-[#00FF9D] flex items-center justify-center shadow-[0_0_8px_rgba(0,255,157,0.2)]">
            <Percent size={22} />
          </div>
          <div className="font-mono">
            <p className="text-2xl font-heading font-black text-text-main tracking-wider">{successRate}%</p>
            <p className="text-xs font-medium text-red-400 mt-0.5">{failedRequests} outages logged</p>
          </div>
        </div>

        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden flex items-center gap-5">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="w-12 h-12 rounded bg-amber-500/10 border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            <Clock size={22} />
          </div>
          <div className="font-mono">
            <p className="text-2xl font-heading font-black text-text-main tracking-wider">{averageLatency} ms</p>
            <p className="text-xs font-medium text-text-muted mt-0.5">Avg delivery latency</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Cost Summary Card */}
        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 relative flex flex-col justify-between min-h-[300px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div>
            <h3 className="font-heading font-bold text-base text-text-main">Token Usage & SLA Cost</h3>
            <div className="flex items-baseline gap-2 my-6 font-mono">
              <span className="text-5xl font-heading font-black text-text-main tracking-wider drop-shadow-[0_0_10px_rgba(248,250,252,0.15)]">
                ${estimatedCost.toFixed(5)}
              </span>
              <span className="text-xs font-bold text-text-muted uppercase">USD</span>
            </div>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Pricing calculations are aggregated using standard token models:
            </p>
            <ul className="list-disc pl-5 text-[11px] text-text-muted space-y-1 mt-2.5 leading-relaxed">
              <li><strong>Gemini Flash</strong>: $0.075 / 1M Input | $0.30 / 1M Output</li>
              <li><strong>Groq Llama 3</strong>: $0.59 / 1M Input | $0.79 / 1M Output</li>
              <li><strong>Groq Whisper</strong>: $0.001 flat per voice transcription</li>
            </ul>
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-text-muted font-bold pt-4 border-t border-border-dark">
            <span>Billing cycle active</span>
            <span className="text-green-400">Real-time updates</span>
          </div>
        </div>

        {/* Action Panel for Raw Exports */}
        <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 relative flex flex-col justify-between min-h-[300px]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div>
            <h3 className="font-heading font-bold text-base text-text-main">Raw Telemetry Logs Export</h3>
            <p className="text-xs text-text-muted leading-relaxed mt-4">
              Export the raw, itemized history of all AI request logs. This report details prompt tokens, completion tokens, latency, features, and error traces.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 font-mono">
            <a 
              href="http://localhost:3000/api/admin/export/analytics?format=xlsx" 
              download 
              className="w-full py-2.5 px-3 rounded bg-[#0b1120] hover:border-[#00FFF0] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main flex items-center justify-center gap-2 transition-all cursor-pointer hover:text-[#00FFF0]"
            >
              <FileSpreadsheet size={15} className="text-[#00FFF0]" />
              <span>Download Excel Ledger</span>
            </a>
            
            <a 
              href="http://localhost:3000/api/admin/export/analytics?format=pdf" 
              download 
              className="w-full py-2.5 px-3 rounded bg-[#0b1120] hover:border-[#00FFF0] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main flex items-center justify-center gap-2 transition-all cursor-pointer hover:text-[#00FFF0]"
            >
              <FileText size={15} className="text-[#00FFF0]" />
              <span>Download PDF Audit</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

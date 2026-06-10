import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ExternalLink, RefreshCw, AlertCircle, Sparkles, Network, Database } from 'lucide-react';

export default function JobSearch() {
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobsList, setJobsList] = useState([]);
  const [searchedRole, setSearchedRole] = useState('');
  const [searchedLocation, setSearchedLocation] = useState('');

  // States for automated recommendations
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedRole, setRecommendedRole] = useState('');
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState('');
  const [hasHistory, setHasHistory] = useState(false);

  // Fetch recommended jobs based on latest report
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      setErrorRecs('');
      try {
        const data = await api.get('/api/interview/history');
        const reports = data.reports || [];
        if (reports.length > 0) {
          setHasHistory(true);
          const latestReport = reports[0];
          const role = latestReport.title || 'Software Engineer';
          setRecommendedRole(role);
          
          try {
            const jobData = await api.post('/api/jobs/search', { jobRole: role });
            setRecommendedJobs(jobData.response?.jobs || []);
          } catch (jobErr) {
            console.error('Failed to fetch recommended jobs:', jobErr);
            setErrorRecs('Failed to load recommended job openings automatically.');
          }
        } else {
          setHasHistory(false);
        }
      } catch (err) {
        console.error('Failed to load history in JobSearch:', err);
        setErrorRecs('Could not check history for recommendations.');
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) return;

    setLoading(true);
    setError('');
    setJobsList([]);
    setSearchedRole(jobRole);
    setSearchedLocation(location);

    try {
      const data = await api.post('/api/jobs/search', { jobRole, location });
      setJobsList(data.response?.jobs || []);
    } catch (err) {
      console.error('Job search failed:', err);
      setError(err.message || 'Agentic search failed. The scraper or model might be overloaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformStyle = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'shine':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-purple-500/10 border-purple-500/30 text-[#A855F7]';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-text-main tracking-widest uppercase">
            Agentic Job Finder
          </h1>
          <p className="text-text-muted font-sans text-xs tracking-wider uppercase mt-1">
            Our AI Agent crawls live openings on LinkedIn and Shine.com directly matching your target role
          </p>
        </div>
      </div>

      {/* Unified Search Control Panel */}
      <div className="p-4 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-5 relative flex items-center">
            <Search className="absolute left-3.5 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Enter job role (e.g. Node.js Developer, React Engineer)..."
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all uppercase tracking-wide"
              required
            />
          </div>
          
          <div className="md:col-span-4 relative flex items-center">
            <MapPin className="absolute left-3.5 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Location (e.g. India, Remote, London)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all uppercase tracking-wide"
            />
          </div>

          <button 
            type="submit" 
            className="md:col-span-3 flex items-center justify-center gap-2 py-2.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer disabled:opacity-50" 
            disabled={loading || !jobRole.trim()}
          >
            {loading ? (
              <>
                <RefreshCw className="spinner" size={14} />
                <span>Searching...</span>
              </>
            ) : (
              <span>Find Live Openings</span>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Results Board */}
      {loading ? (
        <div className="p-8 md:p-12 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative text-center glow-primary">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div className="text-center max-w-md w-full mx-auto space-y-6">
            <div className="inline-flex p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#00FFF0] animate-pulse">
              <Sparkles size={36} className="spinner text-[#00FFF0]" />
            </div>
            
            <h2 className="text-lg font-heading font-black text-[#00FFF0] uppercase tracking-widest">
              AI Agent is Searching Opportunities...
            </h2>
            
            <p className="text-[11px] font-mono text-text-muted leading-relaxed uppercase tracking-wider">
              Querying live index. Web-scraping public channels on LinkedIn and Shine matching <strong className="text-text-main">"{searchedRole}"</strong> {searchedLocation && `in "${searchedLocation}"`}.
            </p>
            
            <div className="w-full max-w-xs mx-auto h-1.5 bg-[#050816] border border-[#00FFF0]/20 rounded-none p-[1px] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : jobsList.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-sm text-[#00FFF0] uppercase tracking-wider">Search Results for "{searchedRole}" {searchedLocation && `in "${searchedLocation}"`}</h3>
            <span className="px-2.5 py-0.5 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-[10px] text-text-muted font-mono tracking-widest uppercase">
              {jobsList.length} Opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsList.map((job, index) => (
              <div 
                key={index} 
                className="p-5 cyber-card cyber-card-hover border border-[#00FFF0]/15 bg-[#0b1120]/60 flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-heading font-black border ${getPlatformStyle(job.platform)}`}>
                      {job.platform}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-sm text-text-main leading-tight line-clamp-2 uppercase tracking-wide" title={job.title}>
                      {job.title}
                    </h4>
                    <div className="flex flex-col gap-1.5 text-[11px] font-mono text-text-muted uppercase">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={12} className="flex-shrink-0 text-primary" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="flex-shrink-0 text-[#00FFF0]" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-[#0b1120] border border-[#00FFF0]/15 hover:border-[#00FFF0] hover:text-[#00FFF0] text-xs font-heading font-bold tracking-widest uppercase transition-all cursor-pointer"
                  >
                    <span>Apply on {job.platform}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchedRole ? (
        <div className="flex flex-col items-center justify-center p-12 text-center gap-4 cyber-card border border-[#00FFF0]/10 bg-[#0b1120]/45 relative">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <Briefcase size={40} className="text-text-muted/30" />
          <div className="space-y-1.5 max-w-md">
            <h4 className="font-heading font-bold text-sm text-[#00FFF0] uppercase tracking-wider">No live listings found</h4>
            <p className="text-xs text-text-muted leading-relaxed font-mono uppercase">The agent could not find active roles matching "{searchedRole}" {searchedLocation && `in "${searchedLocation}"`} right now. Try adjusting your search keywords.</p>
          </div>
        </div>
      ) : null}

      {/* Automatic Recommendations Section */}
      <div className="space-y-6 pt-6 border-t border-[#00FFF0]/15">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-base text-[#00FFF0] uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="text-[#00FFF0] animate-pulse" size={16} />
            <span>Personalized Matches</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[9px] font-heading font-black bg-[#FF2E9A]/10 text-[#FF2E9A] border border-[#FF2E9A]/20 uppercase tracking-widest">
            Auto-Matched
          </span>
        </div>

        {loadingRecs ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-text-muted cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
            <RefreshCw className="spinner text-[#00FFF0]" size={32} />
            <p className="text-xs font-mono uppercase">Analyzing history and pulling matched jobs...</p>
          </div>
        ) : errorRecs ? (
          <div className="flex items-center gap-2.5 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            <AlertCircle size={14} />
            <span>{errorRecs}</span>
          </div>
        ) : !hasHistory ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-4 cyber-card border border-[#00FFF0]/10 bg-[#0b1120]/45 relative">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <Sparkles size={32} className="text-text-muted/30 animate-pulse" />
            <div className="space-y-1.5 max-w-md">
              <h4 className="font-heading font-bold text-sm text-[#00FFF0] uppercase tracking-wider">Get Automated Recommendations</h4>
              <p className="text-xs text-text-muted leading-relaxed font-mono uppercase">Upload and analyze your resume first to automatically get active job recommendations matching your profile role.</p>
            </div>
            <Link to="/upload" className="px-5 py-2.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer">
              Analyze Resume
            </Link>
          </div>
        ) : recommendedJobs.length > 0 ? (
          <div className="space-y-4">
            <div className="text-xs font-mono text-text-muted uppercase">
              Found <strong className="text-[#00FFF0]">{recommendedJobs.length}</strong> job openings matching your analyzed resume profile for <strong className="text-text-main">"{recommendedRole}"</strong>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job, index) => (
                <div 
                  key={index} 
                  className="p-5 cyber-card cyber-card-hover border border-[#00FFF0]/15 bg-[#0b1120]/60 flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  <div className="cyber-corner-tr" />
                  <div className="cyber-corner-bl" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-heading font-black border ${getPlatformStyle(job.platform)}`}>
                        {job.platform}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] uppercase font-heading font-black bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] tracking-widest">
                        Match
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-heading font-bold text-sm text-text-main leading-tight line-clamp-2 uppercase tracking-wide" title={job.title}>{job.title}</h4>
                      <div className="flex flex-col gap-1.5 text-[11px] font-mono text-text-muted uppercase">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={12} className="flex-shrink-0 text-primary" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="flex-shrink-0 text-[#00FFF0]" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-[#0b1120] border border-[#00FFF0]/15 hover:border-[#00FFF0] hover:text-[#00FFF0] text-xs font-heading font-bold tracking-widest uppercase transition-all cursor-pointer"
                    >
                      <span>Apply on {job.platform}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-4 cyber-card border border-[#00FFF0]/10 bg-[#0b1120]/45 relative">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <Briefcase size={40} className="text-text-muted/30" />
            <div className="space-y-1.5 max-w-md font-mono uppercase">
              <h4 className="font-heading font-bold text-sm text-[#00FFF0] tracking-wider">No matches found for "{recommendedRole}"</h4>
              <p className="text-xs text-text-muted leading-relaxed">Our search agent couldn't find live postings matching your resume role at this moment. You can search manually above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

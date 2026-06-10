import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Info, 
  Sparkles, 
  FolderOpen, 
  Printer, 
  Download, 
  Edit3, 
  Save, 
  LayoutTemplate, 
  Briefcase, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TemplateRenderer from '../components/templates/TemplateRenderer';
import ResumeEditor from '../components/ResumeEditor';
import { exportToDocx } from '../utils/docxExport';

export default function TailorResume() {
  const SESSION_KEY = 'tailor_resume_session';

  // Restore session from sessionStorage on mount
  const savedSession = (() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  })();

  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState(savedSession?.resumeSource || 'saved');
  const [selectedResumeId, setSelectedResumeId] = useState(savedSession?.selectedResumeId || '');

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(savedSession?.jobDescription || '');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(savedSession?.result || null);
  const [selectedTemplate, setSelectedTemplate] = useState(savedSession?.selectedTemplate || 'modern');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [resumeName, setResumeName] = useState(savedSession?.resumeName || '');
  
  const [isDragOver, setIsDragOver] = useState(false);

  // Persist session state to sessionStorage whenever key values change
  useEffect(() => {
    const session = { result, jobDescription, selectedTemplate, resumeName, resumeSource, selectedResumeId };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [result, jobDescription, selectedTemplate, resumeName, resumeSource, selectedResumeId]);
  
  const templates = [
    { id: 'modern', name: 'Modern Professional', desc: 'Clean layout, ideal for tech roles' },
    { id: 'corporate', name: 'Corporate', desc: 'Traditional business style, ATS-friendly' },
    { id: 'minimal', name: 'Minimal', desc: 'Simple black-and-white, max spacing' },
    { id: 'creative', name: 'Creative', desc: 'Modern visual design, highlight sections' },
    { id: 'student', name: 'Student / Fresher', desc: 'Prioritizes education and projects' }
  ];
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const totalWidth = rect.width;
        if (totalWidth < 100) return; // Ignore zero or tiny transitional widths
        
        const isStacked = window.innerWidth < 1280;
        const availableWidth = (isEditing && !isStacked) ? (totalWidth - 504) : totalWidth;
        const targetWidth = 820; // 210mm in pixels + safety margins
        if (availableWidth < targetWidth) {
          setScale(availableWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };

    // Run after a short timeout to let layout settle
    const timer = setTimeout(updateScale, 100);

    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [result, isEditing]);

  useEffect(() => {
    const fetchResumesList = async () => {
      try {
        const data = await api.get('/api/resumeUpload/');
        const list = data.resumes || [];
        setSavedResumes(list);
        // Only auto-select if no saved session exists
        if (!savedSession?.selectedResumeId) {
          if (list.length > 0) {
            setSelectedResumeId(list[0]._id);
            setResumeSource('saved');
          } else {
            setResumeSource('upload');
          }
        }
      } catch (err) {
        console.error("Failed to load saved resumes:", err);
        setResumeSource('upload');
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumesList();
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Analyzing Base Resume...",
    "Extracting Job Description Keywords...",
    "Aligning Experience and Skills...",
    "Optimizing for ATS Formatting...",
    "Rendering Final Output..."
  ];

  const extractJobTitle = (jd) => {
    if (!jd) return 'Tailored_Resume';
    const match = jd.match(/(?:job title|role|position)[\s:]*([a-zA-Z0-9\s-]+)/i);
    let titleStr = '';
    if (match && match[1]) {
      titleStr = match[1].trim();
    } else {
      titleStr = jd.split('\n')[0].trim().split(/\s+/).slice(0, 4).join(' ');
    }
    return (titleStr.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '_') + '_Resume').replace(/^_+|_+$/g, '');
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };
  const triggerFileSelect = () => fileInputRef.current.click();
  const removeFile = () => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resumeSource === 'saved' && !selectedResumeId) return setError('Please select a saved resume.');
    if (resumeSource === 'upload' && !file) return setError('Please upload a resume PDF file.');

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let data;
      if (resumeSource === 'saved') {
        data = await api.post('/api/tailor/', { resumeId: selectedResumeId, jobDescription });
      } else {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        data = await api.upload('/api/tailor/', formData);
      }
      setResult(data.response);
      setResumeName(extractJobTitle(jobDescription));
    } catch (err) {
      setError(err.message || 'An error occurred during resume tailoring.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setResult(null);
    setError('');
    setIsEditing(false);
    setResumeName('');
    setSelectedTemplate('modern');
    sessionStorage.removeItem(SESSION_KEY); // clear persisted session
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setResumesLoading(true);
    api.get('/api/resumeUpload/')
      .then(data => {
        const list = data.resumes || [];
        setSavedResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
          setResumeSource('saved');
        } else {
          setResumeSource('upload');
        }
      })
      .catch(console.error)
      .finally(() => setResumesLoading(false));
  };

  const isSubmitDisabled = () => (!jobDescription || (resumeSource === 'saved' && !selectedResumeId) || (resumeSource === 'upload' && !file));
  
  const handlePrint = () => {
    const originalTitle = document.title;
    if (resumeName) document.title = resumeName;
    window.print();
    document.title = originalTitle;
  };
  const handleDocxDownload = () => exportToDocx(result, selectedTemplate, resumeName);
  
  const handleSaveToProfile = async () => {
    if (!resumeName.trim()) {
      setError('Resume Name cannot be empty.');
      return;
    }
    setIsSaving(true);
    setSaveSuccess('');
    setError('');
    try {
      await api.post('/api/tailor/save', { editedData: result, resumeName });
      setSaveSuccess('Saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save resume. ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Post-Generation Workspace UI
  // -------------------------------------------------------------
  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted no-print">
          <span className="hover:text-[#00FFF0] transition-colors cursor-pointer" onClick={resetForm}>Tailoring</span>
          <ChevronRight size={14} />
          <span className="text-[#00FFF0]">Workspace</span>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Control Column */}
          {!isEditing && (
            <div className="xl:col-span-4 space-y-6 no-print xl:sticky xl:top-6">
              
              {/* Workspace Actions Panel */}
              <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="absolute top-0 right-0 p-2 text-[8px] text-[#00FFF0]/40 font-mono tracking-widest uppercase">// MODULE_CONTROL</div>
                
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 mb-4">
                  <Edit3 className="text-[#00FFF0]" size={16} />
                  <span className="uppercase tracking-widest">Workspace Actions</span>
                </h3>
                
                <button 
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Resume Content
                </button>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button 
                    className="py-2 rounded-lg bg-[#0b1120] hover:border-[#00FFF0]/55 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    onClick={handleSaveToProfile} 
                    disabled={isSaving}
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                  <button 
                    className="py-2 rounded-lg bg-[#0b1120] hover:border-[#FF2E9A]/55 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#FF2E9A] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    onClick={resetForm}
                  >
                    <RefreshCw size={14} />
                    <span>Start Over</span>
                  </button>
                </div>
                {saveSuccess && <p className="text-xs text-[#00FF9D] font-mono text-center mt-3 animate-pulse">▲ {saveSuccess}</p>}
                {error && <p className="text-xs text-[#FF4D6D] font-mono text-center mt-3">▼ {error}</p>}
              </div>

              {/* Export Panel */}
              <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="absolute top-0 right-0 p-2 text-[8px] text-[#00FFF0]/40 font-mono tracking-widest uppercase">// EXPORT_MATRIX</div>
                
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 mb-4">
                  <Download className="text-[#00FFF0]" size={16} />
                  <span className="uppercase tracking-widest">Export Options</span>
                </h3>
                
                <div className="flex flex-col gap-2">
                  <button 
                    className="w-full py-2.5 px-3 rounded-lg bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main flex items-center gap-2 transition-colors cursor-pointer hover:text-[#00FFF0]"
                    onClick={handleDocxDownload}
                  >
                    <FileText size={16} className="text-[#00FFF0]" />
                    <span>Download as DOCX</span>
                  </button>
                  <button 
                    className="w-full py-2.5 px-3 rounded-lg bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main flex items-center gap-2 transition-colors cursor-pointer hover:text-[#00FFF0]"
                    onClick={handlePrint}
                  >
                    <Printer size={16} className="text-[#00FFF0]" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              </div>

              {/* Templates Panel */}
              <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="absolute top-0 right-0 p-2 text-[8px] text-[#00FFF0]/40 font-mono tracking-widest uppercase">// STYLING_SHELL</div>
                
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 mb-3">
                  <LayoutTemplate className="text-[#00FFF0]" size={16} />
                  <span className="uppercase tracking-widest">Change Template</span>
                </h3>
                
                <div className="flex flex-col gap-2">
                  {templates.map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-3 rounded-lg border text-xs font-heading font-bold flex items-center justify-between cursor-pointer transition-all ${
                        selectedTemplate === tpl.id 
                          ? 'bg-[#00FFF0]/5 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.15)]' 
                          : 'border-[#00FFF0]/15 bg-[#0b1120]/80 text-text-muted hover:text-text-main hover:border-[#00FFF0]/40'
                      }`}
                    >
                      <span className="uppercase tracking-wider">{tpl.name}</span>
                      {selectedTemplate === tpl.id && <CheckCircle size={14} className="text-[#00FFF0]" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS Dashboard Panel */}
              <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="absolute top-0 right-0 p-2 text-[8px] text-[#00FFF0]/40 font-mono tracking-widest uppercase">// REALTIME_DIAGNOSTICS</div>
                
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 mb-4">
                  <Sparkles className="text-[#00FFF0]" size={16} />
                  <span className="uppercase tracking-widest">ATS Analyzer Dashboard</span>
                </h3>
                 
                <div className="flex flex-col items-center justify-center pt-2 pb-4 border-b border-[#00FFF0]/10 mb-4">
                  <div className="cyber-progress-circle shadow-md" style={{ '--progress': result.atsAnalysis.matchScore || 0 }}>
                    <span className="cyber-progress-text">{result.atsAnalysis.matchScore || 0}%</span>
                  </div>
                  <span className="text-[10px] font-heading font-bold text-text-muted uppercase tracking-widest mt-3">ATS Match Compatibility</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-heading font-bold uppercase text-[#00FF9D] tracking-widest block">Matched Keywords</h4>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {result.atsAnalysis.matchingSkills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00FF9D]/5 border border-[#00FF9D]/20 text-[#00FF9D]">
                          {skill}
                        </span>
                      ))}
                      {result.atsAnalysis.matchingSkills.length === 0 && (
                        <span className="text-[10px] font-mono text-text-muted">No matches identified.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-heading font-bold uppercase text-[#FF4D6D] tracking-widest block">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {result.atsAnalysis.missingSkills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FF4D6D]/5 border border-[#FF4D6D]/20 text-[#FF4D6D]">
                          {skill}
                        </span>
                      ))}
                      {result.atsAnalysis.missingSkills.length === 0 && (
                        <span className="text-[10px] font-mono text-[#00FF9D]">None! Full keyword parity.</span>
                      )}
                    </div>
                  </div>
                  
                  <details className="group rounded-lg bg-[#0b1120] border border-[#00FFF0]/15 p-3.5 transition-all">
                    <summary className="font-heading font-bold cursor-pointer text-xs text-[#00FFF0] group-open:text-text-main flex items-center justify-between uppercase tracking-wider">
                      <span>View ATS Suggestions</span>
                      <span className="text-text-muted text-[8px] group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <ul className="mt-3 list-decimal pl-4 text-[10px] font-mono text-text-muted space-y-2 leading-relaxed border-t border-[#00FFF0]/10 pt-2.5">
                      {result.atsAnalysis.suggestionsForImprovement.map((sug, i) => (
                        <li key={i} className="pl-1"><span className="text-text-main">{sug}</span></li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>

            </div>
          )}

          {/* Right Canvas / Workstation Area */}
          <div ref={containerRef} className={`space-y-6 flex flex-col items-center w-full min-w-0 ${isEditing ? 'xl:col-span-12' : 'xl:col-span-8'}`}>
            
            {/* Resume Metadata Header (Name Editor) */}
            <div className="w-full max-w-[210mm] p-4 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/80 flex items-center gap-3.5 no-print">
              <div className="cyber-corner-tr" />
              <div className="cyber-corner-bl" />
              <FileText className="text-[#00FFF0] flex-shrink-0 animate-pulse" size={20} />
              <div className="flex-1 min-w-0">
                <label className="text-[8px] uppercase font-heading font-bold text-text-muted tracking-widest block">Resume Name</label>
                <input 
                  type="text" 
                  value={resumeName} 
                  onChange={(e) => setResumeName(e.target.value.replace(/[^a-zA-Z0-9_ -\.]/g, ''))}
                  className="w-full border-none bg-transparent text-sm font-heading font-bold text-text-main focus:outline-none placeholder-[#94A3B8]/30 p-0 tracking-wider"
                  placeholder="e.g. Software_Engineer_Resume"
                  required
                />
              </div>
              <Edit3 size={16} className="text-[#00FFF0] flex-shrink-0" />
            </div>

            {isEditing ? (
              <div className="flex flex-col xl:flex-row gap-6 w-full items-start">
                
                {/* Editor Module */}
                <div className="w-full xl:w-[480px] space-y-4 no-print flex-shrink-0">
                  <div className="cyber-card p-4 border border-[#00FFF0]/15 bg-[#0b1120]/80 flex justify-between items-center relative">
                    <div className="cyber-corner-tr" />
                    <div className="cyber-corner-bl" />
                    
                    <h3 className="font-heading font-bold text-sm text-[#00FFF0] flex items-center gap-2 uppercase tracking-widest">
                      <Edit3 size={16} />
                      <span>Editing Content</span>
                    </h3>
                    <button 
                      className="px-3 py-1.5 rounded bg-[#0b1120] hover:border-[#FF2E9A]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#FF2E9A] cursor-pointer transition-colors"
                      onClick={() => setIsEditing(false)}
                    >
                      Close Editor
                    </button>
                  </div>
                  
                  <div className="cyber-card p-2 border border-[#00FFF0]/15 bg-[#0b1120]/90 max-h-[75vh] overflow-y-auto">
                    <ResumeEditor data={result} onChange={setResult} />
                  </div>
                </div>
                
                {/* Preview module next to editor */}
                <div className="flex-1 w-full pb-8 flex justify-center items-start overflow-auto min-w-0">
                  <div 
                    style={{ 
                      width: `${794 * scale * 0.95}px`,
                      height: `${297 * 3.7795 * scale * 0.95}px`,
                      overflow: 'auto'
                    }}
                  >
                    <div 
                      className="tailored-resume live-preview shadow-2xl bg-white border-2 border-[#00FFF0]/30 rounded-sm" 
                      style={{ 
                        width: '210mm', 
                        minWidth: '210mm', 
                        minHeight: '297mm', 
                        transform: `scale(${scale * 0.95})`, 
                        transformOrigin: 'top left' 
                      }}
                    >
                      <TemplateRenderer templateId={selectedTemplate} data={result} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Canvas mode */
              <div className="flex-1 w-full pb-8 flex justify-center items-start overflow-auto min-w-0">
                <div 
                  style={{ 
                    width: `${794 * scale}px`,
                    height: `${297 * 3.7795 * scale}px`,
                    overflow: 'auto'
                  }}
                >
                  <div 
                    className="tailored-resume shadow-2xl bg-white border-2 border-slate-700/60 rounded-sm" 
                    style={{ 
                      width: '210mm', 
                      minWidth: '210mm', 
                      minHeight: '297mm', 
                      transform: `scale(${scale})`, 
                      transformOrigin: 'top left' 
                    }}
                  >
                    <TemplateRenderer templateId={selectedTemplate} data={result} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .tailored-resume, .tailored-resume * { visibility: visible; }
            .tailored-resume { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; transform: none !important; }
            .no-print { display: none !important; }
          }
        `}} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Pre-Generation Multistep Form Redesign
  // -------------------------------------------------------------
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="text-center space-y-3 relative py-4">
        <h1 className="text-4xl font-heading font-black text-text-main tracking-widest uppercase">
          AI Resume Tailoring
        </h1>
        <p className="text-text-muted font-sans text-xs tracking-wider max-w-xl mx-auto uppercase">
          Optimize your resume against a specific target description to maximize ATS keyword scoring.
        </p>
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00FFF0] to-transparent mx-auto mt-2" />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 md:p-12 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative text-center glow-primary">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div className="text-center max-w-md w-full mx-auto space-y-6">
            <div className="inline-flex p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#00FFF0] animate-pulse relative">
              <Sparkles size={36} className="spinner text-[#00FFF0]" />
              <div className="absolute inset-0 border border-[#00FFF0] rounded-xl animate-ping opacity-25" />
            </div>
            
            <h2 className="text-lg font-heading font-black text-[#00FFF0] uppercase tracking-widest">
              Optimizing Resume Keywords...
            </h2>
            
            <p className="text-[11px] font-mono text-text-muted tracking-wide min-h-[16px]">
              &gt;&gt; {loadingMessages[loadingStep]}
            </p>
            
            {/* Progress loader bar */}
            <div className="w-full max-w-xs mx-auto h-2 bg-[#0b1120] border border-[#00FFF0]/20 rounded-none p-[1px] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" 
                style={{ width: `${(loadingStep + 1) * 20}%` }}
              ></div>
            </div>
            
            <div className="text-[9px] font-mono text-[#00FFF0]/40 uppercase tracking-widest">
              System Core Temp: Nominal | Telemetry Active
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Base Selection */}
          <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded bg-[#00FFF0]/15 border border-[#00FFF0]/40 text-[#00FFF0] flex items-center justify-center font-heading font-black text-sm shadow-[0_0_10px_rgba(0,255,240,0.15)]">
                01
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm uppercase text-text-main tracking-widest">Select Base Resume</h3>
                <p className="text-[10px] font-mono text-text-muted mt-0.5 uppercase tracking-wider">Select a saved resume from your profile or upload a new PDF file.</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              {resumesLoading ? (
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted p-3.5 rounded border border-[#00FFF0]/15 bg-[#0b1120]/40">
                  <RefreshCw className="spinner text-[#00FFF0]" size={14} />
                  <span>EXTRACTING DATA DIRECTORIES...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-[#0b1120] border border-[#00FFF0]/15 text-sm text-text-main focus:outline-none focus:border-[#00FFF0] focus:shadow-[0_0_15px_rgba(0,255,240,0.1)] transition-all cursor-pointer appearance-none uppercase font-mono tracking-wider"
                    value={resumeSource === 'upload' ? 'upload' : selectedResumeId}
                    onChange={(e) => {
                      if (e.target.value === 'upload') {
                        setResumeSource('upload');
                        setSelectedResumeId('');
                      } else {
                        setResumeSource('saved');
                        setSelectedResumeId(e.target.value);
                      }
                    }}
                  >
                    {savedResumes.map(r => (
                      <option key={r._id} value={r._id} className="bg-[#0b1120] text-text-main">📁 {r.filename}</option>
                    ))}
                    <option value="upload" className="bg-[#0b1120] text-[#FF2E9A]">Upload a new resume (.pdf)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">
                    ▼
                  </div>
                </div>
              )}

              {resumeSource === 'upload' ? (
                <div 
                  className={`w-full min-h-[160px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    isDragOver 
                      ? 'border-[#00FFF0] bg-[#00FFF0]/5' 
                      : file 
                        ? 'border-[#00FF9D]/40 bg-[#00FF9D]/5' 
                        : 'border-[#00FFF0]/20 bg-[#050816]/50 hover:border-[#00FFF0]/40'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!file ? triggerFileSelect : undefined}
                >
                  <div className="scanner-line opacity-25" />
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3 w-full relative z-10">
                      <FileText size={40} className="text-[#00FF9D] drop-shadow-[0_0_8px_rgba(0,255,157,0.3)] animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold text-text-main truncate max-w-[280px]">{file.name}</p>
                        <p className="text-[9px] text-[#00FF9D] font-mono font-bold uppercase tracking-widest">DATA DETECTED: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button" 
                        className="px-3 py-1 rounded bg-[#0b1120] hover:border-[#FF4D6D]/45 border border-[#00FFF0]/15 text-[10px] font-heading font-bold text-text-muted hover:text-[#FF4D6D] transition-colors cursor-pointer" 
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      >
                        PURGE FILE
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5 relative z-10">
                      <Upload size={32} className="text-text-muted animate-pulse" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-heading font-bold text-text-main uppercase tracking-widest">Drag & Drop Resume PDF</h4>
                        <p className="text-[9px] font-mono text-text-muted uppercase tracking-wider">or click to browse local files (max size 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded bg-[#00FFF0]/5 border border-[#00FFF0]/15 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 text-[8px] text-[#00FFF0]/30 font-mono tracking-widest uppercase">// Selected Resume</div>
                  <FolderOpen size={24} className="text-[#00FFF0] flex-shrink-0 drop-shadow-[0_0_6px_rgba(0,229,255,0.3)]" />
                  <div className="space-y-0.5">
                    <h4 className="font-heading font-bold text-xs text-text-main uppercase tracking-wider">Saved Resume Selected</h4>
                    <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Using stored resume data from your profile. No upload required.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: JD Input */}
          <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded bg-[#00FFF0]/15 border border-[#00FFF0]/40 text-[#00FFF0] flex items-center justify-center font-heading font-black text-sm shadow-[0_0_10px_rgba(0,255,240,0.15)]">
                02
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm uppercase text-text-main tracking-widest">Target Job Description</h3>
                <p className="text-[10px] font-mono text-text-muted mt-0.5 uppercase tracking-wider">Paste the target job description to match skills and experiences.</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <textarea
                rows={6}
                placeholder="Example: We are looking for a Software Engineer with strong experience in React, Node.js, and MongoDB..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] focus:shadow-[0_0_15px_rgba(0,255,240,0.1)] transition-all resize-none leading-relaxed"
                required
              />
              <div className="text-right text-[9px] font-mono text-text-muted uppercase tracking-widest">
                {jobDescription.length} characters
              </div>
            </div>
          </div>

          {/* Step 3: Template Selector */}
          <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded bg-[#00FFF0]/15 border border-[#00FFF0]/40 text-[#00FFF0] flex items-center justify-center font-heading font-black text-sm shadow-[0_0_10px_rgba(0,255,240,0.15)]">
                03
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm uppercase text-text-main tracking-widest">Select Visual Template</h3>
                <p className="text-[10px] font-mono text-text-muted mt-0.5 uppercase tracking-wider">Choose how your tailored resume will be formatted and outputted.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {templates.map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-4 rounded-lg border text-left cursor-pointer transition-all relative overflow-hidden group ${
                    selectedTemplate === tpl.id 
                      ? 'bg-[#00FFF0]/5 border-[#00FFF0] shadow-[0_0_15px_rgba(0,255,240,0.15)]' 
                      : 'border-[#00FFF0]/15 bg-[#050816]/50 hover:bg-[#0b1120] hover:border-[#00FFF0]/40'
                  }`}
                >
                  <LayoutTemplate size={22} className={`mb-3 ${selectedTemplate === tpl.id ? 'text-[#00FFF0]' : 'text-text-muted group-hover:text-text-main'}`} />
                  <h4 className={`text-xs font-heading font-bold uppercase tracking-wider ${selectedTemplate === tpl.id ? 'text-[#00FFF0]' : 'text-text-main'}`}>{tpl.name}</h4>
                  <p className="text-[9px] font-mono text-text-muted mt-1 leading-normal uppercase">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
             <button 
               type="submit" 
               className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-primary via-accent to-primary text-white font-heading font-bold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 cursor-pointer disabled:opacity-50 hover:brightness-110" 
               disabled={isSubmitDisabled() || loading}
             >
               <Sparkles size={14} className="animate-spin-slow" />
               <span>Generate Tailored Resume</span>
               <ArrowRight size={14} />
             </button>
          </div>
        </form>
      )}
    </div>
  );
}

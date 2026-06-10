import React, { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  FileText, Upload, Trash2, Star, 
  History, CheckCircle, AlertCircle, 
  RefreshCw, X, Download, Copy, Eye, Check 
} from 'lucide-react';

export default function ResumeDashboardCard({ 
  resumes: initialResumes, 
  loading, 
  onUploadSuccess 
}) {
  const [resumes, setResumes] = useState([]);

  // Sync prop resumes to local state
  useEffect(() => {
    if (initialResumes) {
      setResumes(initialResumes);
      if (initialResumes.length > 0) {
        const defaultId = localStorage.getItem('default_resume_id') || initialResumes[0]._id;
        setSelectedResumeId(initialResumes.some(r => r._id === defaultId) ? defaultId : initialResumes[0]._id);
      } else {
        setSelectedResumeId('');
      }
    }
  }, [initialResumes]);

  // Version histories state
  const [versions, setVersions] = useState({
    'r1': [
      { id: 'v1.3', versionNum: 'v3', createdDate: '2026-06-01T12:00:00Z', notes: 'Added advanced React skills & tailwind descriptions' },
      { id: 'v1.2', versionNum: 'v2', createdDate: '2026-05-15T09:00:00Z', notes: 'Integrated project hyperlinks' },
      { id: 'v1.1', versionNum: 'v1', createdDate: '2026-05-01T10:00:00Z', notes: 'Initial upload' }
    ],
    'r2': [
      { id: 'v2.2', versionNum: 'v2', createdDate: '2026-06-05T14:30:00Z', notes: 'Added MongoDB database layout configurations' },
      { id: 'v2.1', versionNum: 'v1', createdDate: '2026-05-20T11:00:00Z', notes: 'Initial draft' }
    ]
  });

  // Local state controllers
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  // Upload and drag and drop states
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleSelectDefault = (id) => {
    localStorage.setItem('default_resume_id', id);
    setSuccess(`Active default resume updated successfully.`);
    // Trigger a state update to force re-render
    setResumes(prev => [...prev]);
  };

  const handleDuplicate = (resume) => {
    const newId = 'r_' + Date.now();
    const duplicateFile = {
      _id: newId,
      filename: resume.filename.replace('.pdf', '_copy.pdf').replace('.docx', '_copy.docx'),
      createdAt: new Date().toISOString(),
      size: resume.size || '1.2 MB'
    };
    
    setResumes(prev => [...prev, duplicateFile]);
    
    // Copy versions
    if (versions[resume._id]) {
      setVersions(prev => ({
        ...prev,
        [newId]: [
          { 
            id: 'v_' + Date.now(), 
            versionNum: 'v1', 
            createdDate: new Date().toISOString(), 
            notes: `Duplicate of ${resume.filename} versions` 
          }
        ]
      }));
    }
    
    setSuccess(`Duplicated "${resume.filename}" successfully.`);
  };



  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/resumeUpload/${id}`);
      setSuccess(`"${name}" deleted successfully.`);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete resume.');
    }
  };

  const handleDownload = (filename) => {
    setSuccess(`Initiating secure download pipeline for "${filename}"...`);
    // Mock download action
    setTimeout(() => {
      alert(`Downloading: ${filename}`);
    }, 500);
  };

  const handleRestoreVersion = (versionNum, resumeId) => {
    setSuccess(`Restored version ${versionNum} successfully.`);
    // Mock update: modify last modified date of the parent resume
    setResumes(prev => prev.map(r => r._id === resumeId ? { ...r, createdAt: new Date().toISOString() } : r));
  };

  const handleDeleteVersion = (versionId, resumeId) => {
    if (!window.confirm("Are you sure you want to delete this version node?")) return;
    setVersions(prev => ({
      ...prev,
      [resumeId]: prev[resumeId].filter(v => v.id !== versionId)
    }));
    setSuccess("Version node purged successfully.");
  };

  // Drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    validateAndUploadFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndUploadFile(file);
  };

  const validateAndUploadFile = (file) => {
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      setError('Please upload a PDF or DOCX file only.');
      setSuccess('');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    handleUploadFile(file);
  };

  const handleUploadFile = async (file) => {
    setError('');
    setSuccess('');
    setUploadProgress(10);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await api.upload('/api/resumeUpload/', formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(null);
        setSuccess(`"${file.name}" uploaded successfully.`);
        if (onUploadSuccess) onUploadSuccess();
      }, 300);

    } catch (err) {
      setUploadProgress(null);
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload resume.');
    }
  };

  const activeVersions = versions[selectedResumeId] || (selectedResumeId ? [
    { id: 'v_' + selectedResumeId, versionNum: 'v1', createdDate: new Date().toISOString(), notes: 'Initial Uploaded document parsed successfully.' }
  ] : []);

  return (
    <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-6">
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />

      <div className="border-b border-[#00FFF0]/10 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-[#00FFF0] animate-pulse" size={18} />
          <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-widest">Resume Management Dashboard</h3>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 text-[#FF4D6D] text-xs font-mono">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs font-mono">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}

      {/* Saved Resumes Directory Grid */}
      <div className="space-y-3">
        <span className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest block">Saved Resumes</span>
        
        <div className="space-y-2.5">
          {resumes.length === 0 ? (
            <p className="text-xs text-text-muted italic">No resumes uploaded. Drag and drop a file below to parse profile credentials.</p>
          ) : (
            resumes.map(r => {
              const isSelected = selectedResumeId === r._id;
              const defaultResumeId = localStorage.getItem('default_resume_id') || (resumes[0] && resumes[0]._id);
              const isDefault = r._id === defaultResumeId;
              return (
                <div 
                  key={r._id} 
                  onClick={() => setSelectedResumeId(r._id)}
                  className={`p-3.5 rounded border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    isSelected 
                      ? 'border-[#00FFF0] bg-[#050816]/80 shadow-[0_0_15px_rgba(0,255,240,0.1)]' 
                      : 'border-[#00FFF0]/10 bg-[#0b1120]/40 hover:border-[#00FFF0]/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelectDefault(r._id); }}
                      className={`p-1 rounded cursor-pointer ${isDefault ? 'text-[#FFD93D]' : 'text-text-muted/30 hover:text-[#FFD93D]/60'}`}
                      title={isDefault ? "Primary Resume" : "Set as primary"}
                    >
                      <Star size={16} fill={isDefault ? "currentColor" : "none"} />
                    </button>
                    
                    <div className="min-w-0 flex-1 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-main truncate max-w-[240px] uppercase tracking-wide">{r.filename}</span>
                        {isDefault && (
                          <span className="px-1.5 py-0.2 rounded text-[7px] font-bold bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/30 uppercase tracking-widest">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">
                        <span>Size: {r.size || '1.2 MB'}</span>
                        <span>Modified: {new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDownload(r.filename)}
                      className="p-1.5 rounded hover:bg-[#00FFF0]/10 text-[#00FFF0]/60 hover:text-[#00FFF0] border border-transparent hover:border-[#00FFF0]/20 cursor-pointer"
                      title="Download Document"
                    >
                      <Download size={13} />
                    </button>
                    <button 
                      onClick={() => handleDuplicate(r)}
                      className="p-1.5 rounded hover:bg-primary/10 text-primary/60 hover:text-primary border border-transparent hover:border-primary/20 cursor-pointer"
                      title="Duplicate Document"
                    >
                      <Copy size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(r._id, r.filename)}
                      className="p-1.5 rounded hover:bg-[#FF4D6D]/15 text-[#FF4D6D]/60 hover:text-[#FF4D6D] border border-transparent hover:border-[#FF4D6D]/30 cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Resume Version History Deck */}
      {resumes.length > 0 && (
        <div className="p-4 rounded-lg bg-[#050816]/75 border border-[#00FFF0]/10 space-y-3.5 pt-4 border-t border-[#00FFF0]/10">
          <span className="text-[9px] font-heading font-bold text-primary uppercase tracking-widest flex items-center gap-1">
            <History size={12} />
            <span>Version History Nodes</span>
          </span>

          <div className="space-y-2 max-h-[165px] overflow-y-auto pr-1">
            {activeVersions.length === 0 ? (
              <p className="text-[10px] text-text-muted italic">No recorded versions found for this profile.</p>
            ) : (
              activeVersions.map(v => (
                <div key={v.id} className="p-2.5 rounded bg-[#0b1120]/70 border border-[#00FFF0]/5 flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1 py-0.1 bg-primary/15 text-primary rounded border border-primary/20 text-[8px] font-bold uppercase tracking-widest">{v.versionNum}</span>
                      <span className="text-text-muted text-[8px]">{new Date(v.createdDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-text-main mt-1 font-sans leading-relaxed text-[10px]">{v.notes}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                      onClick={() => handleRestoreVersion(v.versionNum, selectedResumeId)}
                      className="px-1.5 py-0.5 rounded border border-[#00FF9D]/30 text-[#00FF9D] text-[8px] font-heading font-bold hover:bg-[#00FF9D]/10 transition-colors uppercase cursor-pointer"
                      title="Restore this version"
                    >
                      Restore
                    </button>
                    <button 
                      onClick={() => handleDeleteVersion(v.id, selectedResumeId)}
                      className="p-1 rounded text-[#FF4D6D]/60 hover:text-[#FF4D6D] cursor-pointer"
                      title="Delete Version Node"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload Drag zone */}
      <div className="space-y-3 pt-4 border-t border-[#00FFF0]/10">
        <span className="text-xs font-heading font-bold text-text-main uppercase tracking-widest block">Upload New Profile Matrix</span>
        
        <div 
          className={`w-full min-h-[120px] rounded border-2 border-dashed flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
            isDragOver ? 'border-[#00FFF0] bg-[#00FFF0]/5' : 'border-[#00FFF0]/20 bg-[#050816]/50 hover:border-[#00FFF0]/40'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadProgress && fileInputRef.current.click()}
        >
          <div className="scanner-line opacity-10" />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.docx" 
            style={{ display: 'none' }}
          />
          
          {uploadProgress !== null ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs font-mono">
              <RefreshCw className="spinner text-[#00FFF0]" size={20} />
              <div className="flex justify-between w-full text-[10px] text-text-muted">
                <span className="uppercase tracking-wider">Parsing file nodes...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1 bg-[#0b1120] overflow-hidden rounded-none p-[1px] border border-[#00FFF0]/10">
                <div className="h-full bg-[#00FFF0]" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={22} className="text-text-muted animate-pulse" />
              <h4 className="text-xs font-heading font-bold text-[#00FFF0] uppercase tracking-widest">Select or Drop PDF / DOCX</h4>
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-wider">Supported format limit: 10MB</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

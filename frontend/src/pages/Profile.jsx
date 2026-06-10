import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  User, Mail, FileText, Trash2, Upload, AlertCircle, CheckCircle, 
  RefreshCw, Calendar, Edit3, Shield, Key, History, X, Cpu, Server, Terminal, Lock
} from 'lucide-react';
import ProfileInfoCard from '../components/ProfileInfoCard';
import CareerPreferencesCard from '../components/CareerPreferencesCard';
import SkillsManagementCard from '../components/SkillsManagementCard';
import ResumeDashboardCard from '../components/ResumeDashboardCard';

export default function Profile() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [user, setUser] = useState(null);
  
  // Resume Edit states
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [editingResumeName, setEditingResumeName] = useState('');
  const fileInputRef = useRef(null);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Password Change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // History states
  const [loginHistory, setLoginHistory] = useState([]);

  // Local storage synced states for career preferences and skills
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('career_preferences');
    return saved ? JSON.parse(saved) : {
      preferredRoles: ["Frontend Developer", "Full Stack Developer"],
      experienceLevel: "Mid-Level",
      workType: "Remote",
      preferredLocations: ["Bangalore", "San Francisco"],
      expectedSalary: "120000",
      salaryCurrency: "USD"
    };
  });

  const [skills, setSkills] = useState(() => {
    const saved = localStorage.getItem('skills_management');
    return saved ? JSON.parse(saved) : [
      { name: "React", category: "Frontend", proficiency: "Advanced" },
      { name: "Node.js", category: "Backend", proficiency: "Intermediate" },
      { name: "MongoDB", category: "Database", proficiency: "Intermediate" },
      { name: "JavaScript", category: "Programming Languages", proficiency: "Expert" },
      { name: "Python", category: "Programming Languages", proficiency: "Intermediate" },
      { name: "DSA", category: "Soft Skills", proficiency: "Advanced" }
    ];
  });

  const fetchUserData = async () => {
    try {
      const data = await api.get('/api/auth/get-me');
      if (data.user) {
        const savedDetails = localStorage.getItem('user_profile_details');
        const parsedDetails = savedDetails ? JSON.parse(savedDetails) : {};
        
        setUser({
          ...data.user,
          ...parsedDetails,
          name: data.user.name, // always prioritize database name & email
          email: data.user.email
        });
        setEditName(data.user.name);
        setEditEmail(data.user.email);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleUpdatePreferences = (updatedPref) => {
    setPreferences(updatedPref);
    localStorage.setItem('career_preferences', JSON.stringify(updatedPref));
    setSuccess("Career preferences updated successfully.");
  };

  const handleUpdateSkills = (updatedSkills) => {
    setSkills(updatedSkills);
    localStorage.setItem('skills_management', JSON.stringify(updatedSkills));
    setSuccess("Skills inventory updated successfully.");
  };

  const handleUpdateProfileDetails = async (updatedInfo) => {
    setError('');
    setSuccess('');
    try {
      // Keep existing api update path (for name and email)
      const res = await api.put('/api/auth/profile', { name: updatedInfo.fullName, email: updatedInfo.email });
      setSuccess("Profile details updated successfully.");
      
      // Update full user object local state with additional fields
      const updatedUser = {
        ...res.user,
        phone: updatedInfo.phone,
        location: updatedInfo.location,
        linkedin: updatedInfo.linkedin,
        github: updatedInfo.github,
        portfolio: updatedInfo.portfolio,
        profileImage: updatedInfo.profileImage
      };
      
      setUser(updatedUser);
      localStorage.setItem('user_profile_details', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Profile details update failed:', err);
      setError(err.message || 'Failed to update profile details.');
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/resumeUpload/');
      setResumes(data.resumes || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Could not retrieve resumes from your profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const historyRes = await api.get('/api/auth/profile/login-history');
      setLoginHistory(historyRes.data || []);
    } catch (err) {
      console.error('Error fetching login history:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchResumes();
    fetchLoginHistory();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/api/auth/profile', { name: editName, email: editEmail });
      setSuccess("Profile updated successfully.");
      setUser(res.user);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      await api.put('/api/auth/profile/change-password', { currentPassword, newPassword });
      setSuccess("Password updated successfully.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update failed:', err);
      setError(err.message || 'Failed to change password.');
    }
  };



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
    uploadResumeFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadResumeFile(file);
  };

  const uploadResumeFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.upload('/api/resumeUpload/', formData);
      setSuccess(`"${file.name}" uploaded successfully.`);
      fetchResumes();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (resumeId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/resumeUpload/${resumeId}`);
      setSuccess(`"${filename}" deleted successfully.`);
      setResumes(prev => prev.filter(r => r._id !== resumeId));
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete resume.');
    }
  };

  const startRename = (resume) => {
    setEditingResumeId(resume._id);
    setEditingResumeName(resume.filename);
  };

  const cancelRename = () => {
    setEditingResumeId(null);
    setEditingResumeName('');
  };

  const saveRename = async (resumeId) => {
    if (!editingResumeName.trim()) {
      setError('Resume name cannot be empty.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/api/resumeUpload/rename/${resumeId}`, { newName: editingResumeName });
      setSuccess(res.message || 'Resume renamed successfully.');
      setResumes(prev => prev.map(r => r._id === resumeId ? { ...r, filename: res.filename } : r));
      setEditingResumeId(null);
    } catch (err) {
      console.error('Rename failed:', err);
      setError(err.message || 'Failed to rename resume.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 relative py-4">
        <h1 className="text-4xl font-heading font-black text-text-main tracking-widest uppercase">
          Account & Profile Settings
        </h1>
        <p className="text-text-muted font-sans text-xs tracking-wider max-w-xl mx-auto uppercase">
          Manage uploaded resumes, edit details, update credentials, and review logged devices
        </p>
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00FFF0] to-transparent mx-auto mt-2" />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] text-xs font-mono">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Row 1: Personal Info & Security (Left) + Resumes & Login History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal info & Credentials */}
        <div className="lg:col-span-5 space-y-8">
          {/* Personal Information */}
          <ProfileInfoCard 
            user={user}
            onUpdate={handleUpdateProfileDetails}
          />

          {/* Change Password */}
          <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="flex items-center gap-2">
              <Key size={18} className="text-primary animate-pulse" />
              <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-widest">Security & Credentials</h3>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-bold text-text-muted uppercase tracking-widest">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full px-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all tracking-wider"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-heading font-bold text-text-muted uppercase tracking-widest">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="w-full px-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all tracking-wider"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-heading font-bold text-text-muted uppercase tracking-widest">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full px-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all tracking-wider"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="px-4 py-2 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Resumes Dashboard & History */}
        <div className="lg:col-span-7 space-y-8">
          {/* Resume Management */}
          <ResumeDashboardCard 
            resumes={resumes}
            loading={loading}
            onUploadSuccess={fetchResumes}
          />

          {/* Login History Ledger */}
          <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="flex items-center gap-2">
              <History size={18} className="text-primary" />
              <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-widest">Login History Ledger</h3>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto pr-1">
              {loginHistory.length === 0 ? (
                <p className="text-xs text-text-muted italic">No login logs available.</p>
              ) : (
                <div className="overflow-x-auto w-full border border-[#00FFF0]/15 rounded bg-[#050816]/75">
                  <table className="w-full text-left text-xs font-mono text-text-main border-collapse">
                    <thead>
                      <tr className="bg-[#0b1120]/80 border-b border-[#00FFF0]/15">
                        <th className="p-2.5 font-heading font-bold text-text-muted uppercase tracking-widest text-[9px]">Timestamp</th>
                        <th className="p-2.5 font-heading font-bold text-text-muted uppercase tracking-widest text-[9px]">IP Address</th>
                        <th className="p-2.5 font-heading font-bold text-text-muted uppercase tracking-widest text-[9px]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginHistory.slice(0, 10).map(hist => (
                        <tr key={hist._id} className="border-b border-[#00FFF0]/5 last:border-0 hover:bg-[#0b1120]/60">
                          <td className="p-2.5 font-medium">{new Date(hist.loginAt).toLocaleString()}</td>
                          <td className="p-2.5 font-medium">{hist.ipAddress}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase tracking-widest ${
                              hist.active ? 'bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/20' : 'bg-[#FF4D6D]/15 text-[#FF4D6D] border border-[#FF4D6D]/20'
                            }`}>
                              {hist.active ? 'active' : 'inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Career Preferences & Skills Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-[#00FFF0]/10">
        <div className="lg:col-span-6">
          <CareerPreferencesCard 
            preferences={preferences}
            onUpdate={handleUpdatePreferences}
          />
        </div>
        <div className="lg:col-span-6">
          <SkillsManagementCard 
            initialSkills={skills}
            onUpdate={handleUpdateSkills}
          />
        </div>
      </div>
    </div>
  );
}


import React, { useState, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, 
  Edit3, X, Check, Camera, AlertCircle 
} from 'lucide-react';

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Github = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProfileInfoCard({ user, onUpdate, onCancel }) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Local form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [github, setGithub] = useState(user?.github || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    
    // Email Validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    // Name Validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    // Phone Validation
    if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    
    // URL Validation function
    const isValidUrl = (url) => {
      if (!url) return true;
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    };
    
    if (linkedin && !isValidUrl(linkedin)) {
      newErrors.linkedin = "Invalid URL (must include http/https)";
    }
    if (github && !isValidUrl(github)) {
      newErrors.github = "Invalid URL (must include http/https)";
    }
    if (portfolio && !isValidUrl(portfolio)) {
      newErrors.portfolio = "Invalid URL (must include http/https)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const updatedData = {
      fullName,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      profileImage
    };
    
    onUpdate(updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to user prop values
    setFullName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setLocation(user?.location || '');
    setLinkedin(user?.linkedin || '');
    setGithub(user?.github || '');
    setPortfolio(user?.portfolio || '');
    setProfileImage(user?.profileImage || '');
    setErrors({});
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: 'Please upload an image file only.' }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: 'Image size must be under 2MB.' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setErrors(prev => {
          const cpy = { ...prev };
          delete cpy.profileImage;
          return cpy;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-5">
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />
      
      <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-3">
        <div className="flex items-center gap-2">
          <User className="text-[#00FFF0] animate-pulse" size={18} />
          <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-widest">Personal Information</h3>
        </div>
        {!isEditing && (
          <button 
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-[10px] font-heading font-bold text-text-main hover:text-[#00FFF0] flex items-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider"
          >
            <Edit3 size={11} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2">
        {/* Profile Picture Upload/Preview Area */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div 
            onClick={triggerFileSelect}
            className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
              isEditing 
                ? 'border-[#00FFF0] cursor-pointer hover:bg-[#00FFF0]/5 group' 
                : 'border-[#00FFF0]/20'
            }`}
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-3 flex flex-col items-center">
                <User size={36} className="text-text-muted/40" />
                {isEditing && <span className="text-[8px] text-[#00FFF0]/60 font-mono mt-1">UPLOAD</span>}
              </div>
            )}
            
            {isEditing && (
              <div className="absolute inset-0 bg-[#050816]/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200">
                <Camera size={18} className="text-[#00FFF0]" />
                <span className="text-[8px] text-[#00FFF0] font-mono mt-1">CHANGE IMAGE</span>
              </div>
            )}
          </div>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          {errors.profileImage && (
            <span className="text-[9px] text-[#FF4D6D] font-mono text-center max-w-[120px]">{errors.profileImage}</span>
          )}
        </div>

        {/* Info Grid */}
        <div className="flex-1 w-full">
          {isEditing ? (
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest">Full Name *</label>
                <div className="relative flex items-center">
                  <User size={12} className="absolute left-3 text-[#00FFF0]/50" />
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0]"
                    required
                  />
                </div>
                {errors.fullName && <p className="text-[9px] text-[#FF4D6D] font-mono">{errors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest">Email Address *</label>
                <div className="relative flex items-center">
                  <Mail size={12} className="absolute left-3 text-[#00FFF0]/50" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0]"
                    required
                  />
                </div>
                {errors.email && <p className="text-[9px] text-[#FF4D6D] font-mono">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone size={12} className="absolute left-3 text-[#00FFF0]/50" />
                  <input 
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 123 456 7890"
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0]"
                  />
                </div>
                {errors.phone && <p className="text-[9px] text-[#FF4D6D] font-mono">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest">Location</label>
                <div className="relative flex items-center">
                  <MapPin size={12} className="absolute left-3 text-[#00FFF0]/50" />
                  <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest">LinkedIn URL</label>
                <div className="relative flex items-center">
                  <Linkedin size={12} className="absolute left-3 text-[#00FFF0]/50" />
                  <input 
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0]"
                  />
                </div>
                {errors.linkedin && <p className="text-[9px] text-[#FF4D6D] font-mono">{errors.linkedin}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest">GitHub URL</label>
                <div className="relative flex items-center">
                  <Github size={12} className="absolute left-3 text-[#00FFF0]/50" />
                  <input 
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0]"
                  />
                </div>
                {errors.github && <p className="text-[9px] text-[#FF4D6D] font-mono">{errors.github}</p>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest">Portfolio Website URL</label>
                <div className="relative flex items-center">
                  <Globe size={12} className="absolute left-3 text-[#00FFF0]/50" />
                  <input 
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0]"
                  />
                </div>
                {errors.portfolio && <p className="text-[9px] text-[#FF4D6D] font-mono">{errors.portfolio}</p>}
              </div>

              <div className="flex gap-2.5 pt-2 sm:col-span-2">
                <button 
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check size={12} />
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-4 py-2 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#FF2E9A] cursor-pointer transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
                <User size={16} className="text-[#00FFF0] drop-shadow-[0_0_4px_rgba(0,229,255,0.3)] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] text-text-muted block uppercase tracking-widest">Full Name</span>
                  <span className="text-xs font-bold text-text-main tracking-wider truncate block">{fullName || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
                <Mail size={16} className="text-[#00FFF0] drop-shadow-[0_0_4px_rgba(0,229,255,0.3)] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] text-text-muted block uppercase tracking-widest">Email Address</span>
                  <span className="text-xs font-bold text-text-main tracking-wider truncate block">{email || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
                <Phone size={16} className="text-[#00FFF0] drop-shadow-[0_0_4px_rgba(0,229,255,0.3)] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] text-text-muted block uppercase tracking-widest">Phone</span>
                  <span className="text-xs font-bold text-text-main tracking-wider truncate block">
                    {phone || <span className="text-text-muted/40 italic">Not Deployed</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
                <MapPin size={16} className="text-[#00FFF0] drop-shadow-[0_0_4px_rgba(0,229,255,0.3)] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] text-text-muted block uppercase tracking-widest">Location</span>
                  <span className="text-xs font-bold text-text-main tracking-wider truncate block">
                    {location || <span className="text-text-muted/40 italic">Not Deployed</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
                <Linkedin size={16} className="text-[#00E5FF] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] text-text-muted block uppercase tracking-widest">LinkedIn</span>
                  {linkedin ? (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#00E5FF] hover:underline truncate block">
                      Profile Link
                    </a>
                  ) : (
                    <span className="text-text-muted/40 italic block">Not Deployed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
                <Github size={16} className="text-[#00FFF0]/80 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] text-text-muted block uppercase tracking-widest">GitHub</span>
                  {github ? (
                    <a href={github} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#00FFF0] hover:underline truncate block">
                      Profile Link
                    </a>
                  ) : (
                    <span className="text-text-muted/40 italic block">Not Deployed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10 sm:col-span-2">
                <Globe size={16} className="text-secondary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] text-text-muted block uppercase tracking-widest">Portfolio Website</span>
                  {portfolio ? (
                    <a href={portfolio} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-secondary hover:underline truncate block">
                      {portfolio}
                    </a>
                  ) : (
                    <span className="text-text-muted/40 italic block">Not Deployed</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

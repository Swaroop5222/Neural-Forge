import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Award, Laptop, MapPin, Coins, 
  Edit3, X, Check, Plus 
} from 'lucide-react';

export default function CareerPreferencesCard({ preferences, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  // Preset Role Options
  const roleOptions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Software Engineer",
    "Data Analyst",
    "Data Scientist",
    "AI/ML Engineer",
    "DevOps Engineer",
    "Cybersecurity Engineer"
  ];

  const experienceOptions = [
    "Student",
    "Fresher",
    "Intern",
    "Junior",
    "Mid-Level",
    "Senior"
  ];

  const workTypeOptions = [
    "Remote",
    "Hybrid",
    "Onsite"
  ];

  const currencyOptions = [
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "INR (₹)", value: "INR" },
    { label: "GBP (£)", value: "GBP" }
  ];

  // Local state initialized from prop or defaults
  const [preferredRoles, setPreferredRoles] = useState(preferences?.preferredRoles || []);
  const [experienceLevel, setExperienceLevel] = useState(preferences?.experienceLevel || 'Mid-Level');
  const [workType, setWorkType] = useState(preferences?.workType || 'Remote');
  const [preferredLocations, setPreferredLocations] = useState(preferences?.preferredLocations || []);
  const [expectedSalary, setExpectedSalary] = useState(preferences?.expectedSalary || '');
  const [salaryCurrency, setSalaryCurrency] = useState(preferences?.salaryCurrency || 'USD');

  // Sync when parent loads preferences from localStorage after async user fetch
  useEffect(() => {
    if (preferences) {
      setPreferredRoles(preferences.preferredRoles || []);
      setExperienceLevel(preferences.experienceLevel || 'Mid-Level');
      setWorkType(preferences.workType || 'Remote');
      setPreferredLocations(preferences.preferredLocations || []);
      setExpectedSalary(preferences.expectedSalary || '');
      setSalaryCurrency(preferences.salaryCurrency || 'USD');
    }
  }, [preferences]);

  // Input states
  const [locationInput, setLocationInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [showRolesDropdown, setShowRolesDropdown] = useState(false);

  const handleAddCustomRole = (e) => {
    if (e) e.preventDefault();
    const role = roleInput.trim();
    if (role && !preferredRoles.includes(role)) {
      setPreferredRoles(prev => [...prev, role]);
      setRoleInput('');
    }
  };

  const handleRoleToggle = (role) => {
    if (preferredRoles.includes(role)) {
      setPreferredRoles(prev => prev.filter(r => r !== role));
    } else {
      setPreferredRoles(prev => [...prev, role]);
    }
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    const loc = locationInput.trim();
    if (loc && !preferredLocations.includes(loc)) {
      setPreferredLocations(prev => [...prev, loc]);
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (loc) => {
    setPreferredLocations(prev => prev.filter(item => item !== loc));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      preferredRoles,
      experienceLevel,
      workType,
      preferredLocations,
      expectedSalary,
      salaryCurrency
    };
    onUpdate(updated);
    setIsEditing(false);
    setShowRolesDropdown(false);
    setRoleInput('');
  };

  const handleCancel = () => {
    // Reset to prop values
    setPreferredRoles(preferences?.preferredRoles || []);
    setExperienceLevel(preferences?.experienceLevel || 'Mid-Level');
    setWorkType(preferences?.workType || 'Remote');
    setPreferredLocations(preferences?.preferredLocations || []);
    setExpectedSalary(preferences?.expectedSalary || '');
    setSalaryCurrency(preferences?.salaryCurrency || 'USD');
    setIsEditing(false);
    setShowRolesDropdown(false);
    setLocationInput('');
    setRoleInput('');
  };

  const formatCurrencySymbol = (code) => {
    switch (code) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  return (
    <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-5">
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />

      <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="text-[#00FFF0] animate-pulse" size={18} />
          <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-widest">Career Preferences</h3>
        </div>
        {!isEditing && (
          <button 
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-[10px] font-heading font-bold text-text-main hover:text-[#00FFF0] flex items-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider"
          >
            <Edit3 size={11} />
            <span>Edit Preferences</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Preferred Roles Selection */}
          <div className="space-y-1.5 relative">
            <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest block">Preferred Roles</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {preferredRoles.map(role => (
                <span key={role} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#00FFF0]/10 border border-[#00FFF0]/30 text-xs font-mono font-bold text-[#00FFF0]">
                  {role}
                  <button type="button" onClick={() => handleRoleToggle(role)} className="hover:text-red-400 focus:outline-none ml-1 cursor-pointer">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={roleInput}
                  onChange={(e) => {
                    setRoleInput(e.target.value);
                    setShowRolesDropdown(true);
                  }}
                  onFocus={() => setShowRolesDropdown(true)}
                  placeholder="Type to search or enter custom role..."
                  className="w-full px-3 py-2 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRole(e);
                    }
                  }}
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddCustomRole}
                className="px-3 rounded border border-[#00FFF0] text-[#00FFF0] hover:bg-[#00FFF0]/10 text-xs font-heading font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
            
            {showRolesDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRolesDropdown(false)} />
                <div className="absolute z-20 w-full mt-1.5 rounded-lg border border-[#00FFF0]/20 bg-[#070c19] shadow-xl p-2.5 max-h-[180px] overflow-y-auto space-y-1">
                  {roleOptions
                    .filter(role => role.toLowerCase().includes(roleInput.toLowerCase()))
                    .map(role => (
                      <div 
                        key={role} 
                        onClick={() => handleRoleToggle(role)}
                        className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-[#00FFF0]/5 cursor-pointer text-xs font-mono text-text-main transition-colors"
                      >
                        <span>{role}</span>
                        <input 
                          type="checkbox" 
                          checked={preferredRoles.includes(role)} 
                          readOnly 
                          className="accent-[#00FFF0]"
                        />
                      </div>
                    ))}
                  {roleInput.trim() && !roleOptions.some(r => r.toLowerCase() === roleInput.trim().toLowerCase()) && (
                    <div 
                      onClick={() => handleAddCustomRole()}
                      className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-[#00FF9D]/10 border border-dashed border-[#00FF9D]/30 cursor-pointer text-xs font-mono text-[#00FF9D] transition-colors"
                    >
                      <span>Add custom role: "{roleInput.trim()}"</span>
                      <Plus size={12} className="text-[#00FF9D]" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Experience Level Pill Selector */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest block">Experience Level</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {experienceOptions.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperienceLevel(level)}
                  className={`py-1.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    experienceLevel === level
                      ? 'bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D] shadow-[0_0_10px_rgba(0,255,157,0.15)]'
                      : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-[#00FFF0]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Work Type Pill Selector */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest block">Preferred Work Type</label>
            <div className="grid grid-cols-3 gap-2">
              {workTypeOptions.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setWorkType(type)}
                  className={`py-2 rounded text-xs font-heading font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                    workType === type
                      ? 'bg-[#00FFF0]/15 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.1)]'
                      : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-text-main'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Locations Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest block">Preferred Locations</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {preferredLocations.map(loc => (
                <span key={loc} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-xs font-mono font-bold text-primary">
                  {loc}
                  <button type="button" onClick={() => handleRemoveLocation(loc)} className="hover:text-red-400 focus:outline-none ml-1 cursor-pointer">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00FFF0]/50" />
                <input 
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Type location and press Add (e.g. Bangalore)"
                  className="w-full pl-8 pr-3 py-2 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLocation(e);
                    }
                  }}
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddLocation}
                className="px-3 rounded border border-primary text-primary hover:bg-primary/10 text-xs font-heading font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Expected Salary Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-widest block">Expected Annual Salary</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Coins size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00FFF0]/50" />
                <input 
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="e.g. 120000"
                  className="w-full pl-8 pr-3 py-2 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] transition-colors"
                />
              </div>
              <div className="w-32">
                <select
                  value={salaryCurrency}
                  onChange={(e) => setSalaryCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] cursor-pointer"
                >
                  {currencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
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
        <div className="space-y-4 font-mono text-xs">
          
          <div className="flex flex-col gap-1.5 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
            <span className="text-[8px] text-text-muted uppercase tracking-widest flex items-center gap-1">
              <Briefcase size={10} className="text-[#00FFF0]" />
              <span>Preferred Roles</span>
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {preferredRoles.length === 0 ? (
                <span className="text-text-muted/40 italic">Not Deployed</span>
              ) : (
                preferredRoles.map(role => (
                  <span key={role} className="px-2 py-0.5 rounded bg-[#00FFF0]/5 border border-[#00FFF0]/15 text-[10px] font-bold text-[#00FFF0]">
                    {role}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
              <Award size={16} className="text-[#00FF9D] flex-shrink-0" />
              <div>
                <span className="text-[8px] text-text-muted block uppercase tracking-widest">Experience Level</span>
                <span className="text-xs font-bold text-text-main tracking-wider">{experienceLevel}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
              <Laptop size={16} className="text-[#00FFF0] flex-shrink-0" />
              <div>
                <span className="text-[8px] text-text-muted block uppercase tracking-widest">Preferred Work Type</span>
                <span className="text-xs font-bold text-text-main tracking-wider">{workType}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
            <span className="text-[8px] text-text-muted uppercase tracking-widest flex items-center gap-1">
              <MapPin size={10} className="text-primary" />
              <span>Preferred Locations</span>
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {preferredLocations.length === 0 ? (
                <span className="text-text-muted/40 italic">Not Deployed</span>
              ) : (
                preferredLocations.map(loc => (
                  <span key={loc} className="px-2 py-0.5 rounded bg-primary/5 border border-primary/15 text-[10px] font-bold text-primary">
                    {loc}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded bg-[#050816] border border-[#00FFF0]/10">
            <Coins size={16} className="text-secondary flex-shrink-0" />
            <div>
              <span className="text-[8px] text-text-muted block uppercase tracking-widest">Expected Salary</span>
              <span className="text-xs font-bold text-text-main tracking-wider">
                {expectedSalary ? (
                  `${formatCurrencySymbol(salaryCurrency)}${Number(expectedSalary).toLocaleString()}/yr`
                ) : (
                  <span className="text-text-muted/40 italic">Not Deployed</span>
                )}
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Plus, Trash2, Search, Edit2, Check, X, 
  Cpu, Award, Sparkles, Filter 
} from 'lucide-react';

export default function SkillsManagementCard({ initialSkills, onUpdate }) {
  const [skills, setSkills] = useState(initialSkills || [
    { name: "React", category: "Frontend", proficiency: "Advanced" },
    { name: "Node.js", category: "Backend", proficiency: "Intermediate" },
    { name: "MongoDB", category: "Database", proficiency: "Intermediate" },
    { name: "JavaScript", category: "Programming Languages", proficiency: "Expert" },
    { name: "Python", category: "Programming Languages", proficiency: "Intermediate" },
    { name: "DSA", category: "Soft Skills", proficiency: "Advanced" }
  ]);

  const categories = [
    "All",
    "Frontend",
    "Backend",
    "Database",
    "Programming Languages",
    "DevOps",
    "Cloud",
    "AI/ML",
    "Soft Skills"
  ];

  const proficiencies = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const suggestions = [
    { name: "React", category: "Frontend" },
    { name: "TypeScript", category: "Programming Languages" },
    { name: "Node.js", category: "Backend" },
    { name: "MongoDB", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
    { name: "Python", category: "Programming Languages" },
    { name: "TensorFlow", category: "AI/ML" },
    { name: "Git", category: "DevOps" }
  ];

  // Forms and filter states
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Frontend");
  const [newSkillProficiency, setNewSkillProficiency] = useState("Intermediate");

  // Inline editing states
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingProficiency, setEditingProficiency] = useState("");

  const handleAddSkill = (e) => {
    e.preventDefault();
    const name = newSkillName.trim();
    if (!name) return;

    // Check duplication
    if (skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      alert("This skill already exists in your inventory.");
      return;
    }

    const newSkill = {
      name,
      category: newSkillCategory,
      proficiency: newSkillProficiency
    };

    const updated = [...skills, newSkill];
    setSkills(updated);
    setNewSkillName("");
    if (onUpdate) onUpdate(updated);
  };

  const handleQuickAdd = (suggested) => {
    if (skills.some(s => s.name.toLowerCase() === suggested.name.toLowerCase())) {
      return; // Already added
    }
    const newSkill = {
      name: suggested.name,
      category: suggested.category,
      proficiency: "Intermediate"
    };
    const updated = [...skills, newSkill];
    setSkills(updated);
    if (onUpdate) onUpdate(updated);
  };

  const handleRemoveSkill = (name) => {
    const updated = skills.filter(s => s.name !== name);
    setSkills(updated);
    if (onUpdate) onUpdate(updated);
  };

  const startEdit = (index, skill) => {
    setEditingIndex(index);
    setEditingName(skill.name);
    setEditingCategory(skill.category);
    setEditingProficiency(skill.proficiency);
  };

  const saveEdit = (index) => {
    if (!editingName.trim()) return;
    const updated = [...skills];
    updated[index] = {
      name: editingName.trim(),
      category: editingCategory,
      proficiency: editingProficiency
    };
    setSkills(updated);
    setEditingIndex(null);
    if (onUpdate) onUpdate(updated);
  };

  const getProficiencyColor = (lvl) => {
    switch (lvl) {
      case 'Expert': return 'bg-[#00FF9D]/10 border-[#00FF9D]/40 text-[#00FF9D]';
      case 'Advanced': return 'bg-[#00FFF0]/10 border-[#00FFF0]/40 text-[#00FFF0]';
      case 'Intermediate': return 'bg-[#FFD93D]/10 border-[#FFD93D]/40 text-[#FFD93D]';
      default: return 'bg-slate-500/10 border-slate-500/40 text-slate-400';
    }
  };

  // Filtering skills
  const filteredSkills = skills.filter(skill => {
    const matchesCategory = activeCategory === "All" || skill.category === activeCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Count items per category helper
  const getCategoryCount = (cat) => {
    if (cat === "All") return skills.length;
    return skills.filter(s => s.category === cat).length;
  };

  return (
    <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-5">
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />

      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="text-[#00FFF0] animate-pulse" size={18} />
          <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-widest">Skills Management</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00FFF0]/10 border border-[#00FFF0]/20 text-[#00FFF0] tracking-widest">
          {skills.length} ACTIVE NODES
        </span>
      </div>

      {/* Add Skill form section */}
      <form onSubmit={handleAddSkill} className="p-4 rounded bg-[#050816]/75 border border-[#00FFF0]/10 space-y-3">
        <span className="text-[9px] font-heading font-bold text-[#00FFF0] uppercase tracking-widest block">// DEPLOY NEW SKILL NODE</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[8px] text-text-muted uppercase tracking-wider block">Skill Name</label>
            <input 
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Docker, TypeScript"
              className="w-full px-3 py-1.5 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0]"
              required
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[8px] text-text-muted uppercase tracking-wider block">Category</label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] cursor-pointer"
            >
              {categories.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[8px] text-text-muted uppercase tracking-wider block">Proficiency</label>
            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] cursor-pointer"
            >
              {proficiencies.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="sm:col-span-2 w-full py-1.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white font-heading font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        {/* Clickable Quick-add Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[8px] font-heading font-bold text-text-muted uppercase tracking-wider">Suggested:</span>
          {suggestions.map(s => {
            const exists = skills.some(active => active.name.toLowerCase() === s.name.toLowerCase());
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => handleQuickAdd(s)}
                disabled={exists}
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                  exists 
                    ? 'border-transparent bg-slate-800 text-text-muted/40 cursor-not-allowed' 
                    : 'border-[#00FFF0]/10 bg-[#0b1120]/40 text-text-muted hover:text-[#00FFF0] hover:border-[#00FFF0]/30'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </form>

      {/* Categories Tabs Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-[#00FFF0]/10 max-w-full scrollbar-thin scrollbar-thumb-cyan/25">
        {categories.map(cat => {
          const count = getCategoryCount(cat);
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-none text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all border ${
                isActive 
                  ? 'bg-[#00FFF0]/10 border-[#00FFF0] text-[#00FFF0] shadow-[inset_0_0_10px_rgba(0,255,240,0.1)]' 
                  : 'border-transparent text-text-muted hover:text-text-main'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-mono ${isActive ? 'bg-[#00FFF0] text-[#050816] font-bold' : 'bg-[#050816] text-text-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live search input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 text-text-muted" size={14} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter skills by name..."
          className="w-full pl-9 pr-4 py-2 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0]"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 text-text-muted hover:text-text-main cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Skills Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs font-mono text-text-muted italic uppercase border border-dashed border-[#00FFF0]/10 bg-[#050816]/30">
            No active skill nodes match filter parameters.
          </div>
        ) : (
          filteredSkills.map((skill, index) => {
            const isEditingSkill = editingIndex === index;
            return (
              <div 
                key={skill.name} 
                className="cyber-card p-3 border border-[#00FFF0]/15 bg-[#050816]/50 flex items-center justify-between hover:border-[#00FFF0]/40 transition-all group relative overflow-hidden"
              >
                {isEditingSkill ? (
                  <div className="flex flex-col gap-2 w-full font-mono text-xs z-10">
                    <input 
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="px-2 py-0.5 rounded bg-[#0b1120] border border-[#00FFF0] text-xs text-text-main focus:outline-none uppercase"
                    />
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <select 
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        className="px-1.5 py-0.5 rounded bg-[#0b1120] border border-[#00FFF0]/20 text-[9px] text-text-muted focus:outline-none cursor-pointer"
                      >
                        {categories.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <select 
                        value={editingProficiency}
                        onChange={(e) => setEditingProficiency(e.target.value)}
                        className="px-1.5 py-0.5 rounded bg-[#0b1120] border border-[#00FFF0]/20 text-[9px] text-text-muted focus:outline-none cursor-pointer"
                      >
                        {proficiencies.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <div className="flex gap-1 ml-auto">
                        <button 
                          onClick={() => saveEdit(index)} 
                          className="px-1.5 py-0.5 rounded border border-[#00FF9D] text-[#00FF9D] hover:bg-[#00FF9D]/15 text-[8px] font-heading font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                          title="Save node"
                        >
                          <Check size={8} />
                          <span>Save</span>
                        </button>
                        <button 
                          onClick={() => setEditingIndex(null)} 
                          className="px-1.5 py-0.5 rounded border border-[#FF4D6D] text-[#FF4D6D] hover:bg-[#FF4D6D]/15 text-[8px] font-heading font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                          title="Cancel editing"
                        >
                          <X size={8} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-text-main truncate block uppercase tracking-wider" title={skill.name}>
                          {skill.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-mono uppercase font-bold tracking-widest ${getProficiencyColor(skill.proficiency)}`}>
                          {skill.proficiency}
                        </span>
                      </div>
                      <span className="text-[8px] text-text-muted uppercase mt-0.5 font-mono tracking-widest">
                        {skill.category}
                      </span>
                    </div>
                    
                    {/* Hover actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 z-10">
                      <button 
                        onClick={() => startEdit(index, skill)}
                        className="p-1 rounded bg-[#0b1120] hover:border-[#00FFF0]/50 border border-[#00FFF0]/10 text-text-muted hover:text-[#00FFF0] cursor-pointer transition-colors"
                        title="Edit Node"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button 
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="p-1 rounded bg-[#0b1120] hover:border-[#FF4D6D]/50 border border-[#00FFF0]/10 text-text-muted hover:text-[#FF4D6D] cursor-pointer transition-colors"
                        title="Remove Node"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

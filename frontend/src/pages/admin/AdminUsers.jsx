import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Search, ShieldAlert, UserCheck, Trash2, Eye, RefreshCw, 
  X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Cpu, Terminal
} from 'lucide-react';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const query = `?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=${roleFilter}&status=${statusFilter}`;
      const res = await api.get(`/api/admin/users${query}`);
      const data = res.data || {};
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to retrieve users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); 
    fetchUsers();
  };

  const handleSuspend = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to suspend "${name}"? Suspended users will be immediately locked out of the system.`)) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/admin/users/${userId}/suspend`);
      setSuccess(`Account for "${name}" has been suspended.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to suspend ${name}.`);
    }
  };

  const handleActivate = async (userId, name) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/admin/users/${userId}/activate`);
      setSuccess(`Account for "${name}" has been activated.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to activate ${name}.`);
    }
  };

  const handleDelete = async (userId, name) => {
    if (userId === currentUser?._id) {
      setError("Privilege Protection Error: You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete user "${name}"? This action will cascade-delete all their resumes, ATS reports, interviews, and session logs. This is irreversible!`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setSuccess(`User "${name}" has been permanently deleted.`);
      setPage(1);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to delete ${name}.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-heading font-black text-text-main tracking-widest uppercase">User Management</h1>
        <p className="text-text-muted font-sans text-xs tracking-wider uppercase mt-1">
          Suspend, activate, delete, and inspect registered system accounts
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] text-xs font-mono">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="p-4 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
          <div className="relative flex items-center flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all uppercase tracking-wide"
            />
          </div>

          <div className="relative">
            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none cursor-pointer appearance-none pr-8 min-w-[120px] uppercase"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin Only</option>
              <option value="user">User Only</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">▼</div>
          </div>

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none cursor-pointer appearance-none pr-8 min-w-[120px] uppercase"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">▼</div>
          </div>

          <button 
            type="submit" 
            className="px-6 py-2.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase transition-all cursor-pointer"
            disabled={loading}
          >
            Search
          </button>
        </form>
      </div>

      {/* User Records Table Card */}
      <div className="cyber-card border border-[#00FFF0]/15 overflow-hidden bg-[#050816]/70">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-text-muted font-mono">
              <RefreshCw className="spinner text-[#00FFF0]" size={28} />
              <p className="text-xs uppercase tracking-widest">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-12 text-xs font-mono text-text-muted italic uppercase">
              No accounts matching search criteria were found.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#0b1120]/60 border-b border-[#00FFF0]/15 text-text-muted font-bold text-[9px] uppercase tracking-widest">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00FFF0]/10 text-text-main">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-[#0b1120]/45">
                    <td className="p-4 font-bold text-text-main font-heading uppercase tracking-wider">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase tracking-widest ${
                        u.role === 'admin' ? 'bg-[#00FFF0]/15 border border-[#00FFF0]/35 text-[#00FFF0]' : 'bg-[#00FF9D]/15 border border-[#00FF9D]/35 text-[#00FF9D]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase tracking-widest ${
                        u.status === 'active' ? 'bg-[#00FF9D]/15 border border-[#00FF9D]/35 text-[#00FF9D]' : 'bg-[#FF4D6D]/15 border border-[#FF4D6D]/35 text-[#FF4D6D]'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted">{formatDate(u.lastActiveAt)}</td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1.5 rounded bg-[#0b1120] hover:border-[#00FFF0] border border-[#00FFF0]/15 text-[9px] font-heading font-bold text-text-main hover:text-[#00FFF0] flex items-center gap-1 transition-all cursor-pointer uppercase tracking-wider"
                          title="Inspect User details"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>

                        {u.status === 'active' ? (
                          <button 
                            onClick={() => handleSuspend(u._id, u.name)}
                            className="p-1.5 rounded border border-[#FF4D6D]/20 hover:bg-[#FF4D6D]/10 text-[#FF4D6D] transition-colors cursor-pointer"
                            title="Suspend User"
                          >
                            <ShieldAlert size={12} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(u._id, u.name)}
                            className="p-1.5 rounded border border-[#00FF9D]/20 hover:bg-[#00FF9D]/10 text-[#00FF9D] transition-colors cursor-pointer"
                            title="Activate User"
                          >
                            <UserCheck size={12} />
                          </button>
                        )}

                        <button 
                          onClick={() => handleDelete(u._id, u.name)}
                          className="p-1.5 rounded border border-[#FF4D6D]/10 text-[#FF4D6D] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={u._id === currentUser?._id}
                          title={u._id === currentUser?._id ? "You cannot delete yourself" : "Delete Account"}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginator */}
        <div className="flex justify-between items-center p-4 bg-[#0b1120]/40 border-t border-[#00FFF0]/15 font-mono">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
            Showing <strong className="text-text-main">{users.length}</strong> of <strong className="text-text-main">{totalUsers}</strong> accounts
          </span>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
              disabled={page === 1}
              className="p-1.5 rounded bg-[#050816] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-text-muted">
              Page <strong className="text-[#00FFF0]">{page}</strong> of <strong className="text-text-main">{totalPages}</strong>
            </span>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={page === totalPages}
              className="p-1.5 rounded bg-[#050816] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Inspect Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-[#050816]/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md cyber-card border border-[#00FFF0]/20 bg-[#0b1120] shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="p-4 border-b border-[#00FFF0]/15 flex justify-between items-center bg-[#0b1120]/80">
              <h3 className="font-heading font-bold text-xs text-[#00FFF0] uppercase tracking-widest">Account Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-text-muted hover:text-text-main cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 space-y-3.5 text-xs font-mono text-text-muted leading-relaxed uppercase">
              <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-2.5">
                <span className="font-semibold">Database ID</span>
                <span className="font-mono text-[#00FF9D] text-[10px] select-all bg-[#050816] px-2 py-0.5 rounded border border-[#00FFF0]/15">{selectedUser._id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-2.5">
                <span className="font-semibold">Full Name</span>
                <span className="text-text-main font-bold font-heading">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-2.5">
                <span className="font-semibold">Email Address</span>
                <span className="text-text-main font-semibold lowercase">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-2.5">
                <span className="font-semibold">Role</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase ${
                  selectedUser.role === 'admin' ? 'bg-[#00FFF0]/15 border border-[#00FFF0]/35 text-[#00FFF0]' : 'bg-[#00FF9D]/15 border border-[#00FF9D]/35 text-[#00FF9D]'
                }`}>{selectedUser.role}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-2.5">
                <span className="font-semibold">Status</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-heading font-black uppercase ${
                  selectedUser.status === 'active' ? 'bg-[#00FF9D]/15 border border-[#00FF9D]/35 text-[#00FF9D]' : 'bg-[#FF4D6D]/15 border border-[#FF4D6D]/35 text-[#FF4D6D]'
                }`}>{selectedUser.status}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#00FFF0]/10 pb-2.5">
                <span className="font-semibold">Last Active</span>
                <span className="text-text-main font-semibold">{formatDate(selectedUser.lastActiveAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Profile Created On</span>
                <span className="text-text-main font-semibold">{formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            <div className="p-4 border-t border-[#00FFF0]/15 bg-[#0b1120]/80 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)} 
                className="px-4 py-2 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] cursor-pointer uppercase tracking-wider"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

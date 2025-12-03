
import React, { useState, useEffect, useRef } from 'react';
import { MockBackend } from '../services/mockBackend';
import { User, AdTier, SecurityLogEntry } from '../types';
import { Ban, CheckCircle, ShieldAlert, User as UserIcon, Activity, Lock, Trash2, RefreshCw, X, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'security'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [adTiers, setAdTiers] = useState<AdTier[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLogEntry[]>([]);
  
  // Security Log Scroll State
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Ban Modal State
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
       if (activeTab === 'users') setUsers(MockBackend.getAllUsers());
       if (activeTab === 'security') setSecurityLogs(MockBackend.getSecurityLogs());
    }, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Smart Auto-Scroll for Logs
  useEffect(() => {
      if (activeTab === 'security' && autoScroll && logsContainerRef.current) {
          const el = logsContainerRef.current;
          el.scrollTop = el.scrollHeight; // Set scrollTop directly to avoid page scroll issues
      }
  }, [securityLogs, activeTab, autoScroll]);

  const handleLogScroll = () => {
      if (!logsContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      // If user is near bottom (within 50px), enable auto-scroll. Otherwise, disable it.
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
  };

  const refreshAll = () => {
      setUsers(MockBackend.getAllUsers());
      setAdTiers(MockBackend.getAdTiers());
      setSecurityLogs(MockBackend.getSecurityLogs());
  };

  const handleBanClick = (user: User) => {
      if (user.isBanned) {
          MockBackend.unbanUser(user.id);
          toast.success("User ban lifted.");
          refreshAll();
      } else {
          setSelectedUser(user);
          setBanType('temporary');
          setBanReason('');
          setBanModalOpen(true);
      }
  };

  const submitBan = () => {
      if (!selectedUser) return;
      if (!banReason.trim()) return toast.error("Please provide a reason.");
      
      MockBackend.banUser(selectedUser.id, banType, banReason);
      toast.success(`User ${banType === 'permanent' ? 'Permanently' : 'Temporarily'} Banned.`);
      setBanModalOpen(false);
      refreshAll();
  };
  
  const handleForceDelete = (userId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      
      if (confirm("Are you sure? This will delete the user and all their products immediately. This cannot be undone.")) {
          try {
            MockBackend.deleteUser(userId);
            toast.success("User permanently deleted.");
            refreshAll();
          } catch (error: any) {
            toast.error(error.message || "Failed to delete user");
          }
      }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Ban Modal */}
      {banModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                          <Ban size={24} /> Ban User: {selectedUser.name}
                      </h3>
                      <button onClick={() => setBanModalOpen(false)}><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Ban Type</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setBanType('temporary')}
                                className={`p-3 rounded-lg border-2 font-bold text-sm ${banType === 'temporary' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'}`}
                              >
                                  Temporary Suspend
                              </button>
                              <button 
                                onClick={() => setBanType('permanent')}
                                className={`p-3 rounded-lg border-2 font-bold text-sm ${banType === 'permanent' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:bg-gray-50'}`}
                              >
                                  Permanent Expel
                              </button>
                          </div>
                      </div>
                      
                      {banType === 'permanent' && (
                          <div className="bg-red-50 text-red-800 text-xs p-3 rounded border border-red-200">
                              <span className="font-bold">Warning:</span> Permanent bans will schedule this account for automatic deletion in 7 days.
                          </div>
                      )}

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
                          <textarea 
                              value={banReason}
                              onChange={(e) => setBanReason(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                              rows={3}
                              placeholder="e.g. Fraudulent transaction activity..."
                          />
                      </div>
                      
                      <button 
                        onClick={submitBan}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                      >
                          Confirm Ban
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><UserIcon size={24} /></div>
            <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600"><ShieldAlert size={24} /></div>
            <div>
                <p className="text-gray-500 text-sm font-medium">Banned Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isBanned).length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600"><Activity size={24} /></div>
            <div>
                <p className="text-gray-500 text-sm font-medium">System Status</p>
                <p className="text-lg font-bold text-green-600">Active</p>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full scrollbar-hide">
            {['users', 'ads', 'security'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)} 
                    className={`px-4 py-2 font-medium text-sm rounded-md capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {tab}
                </button>
            ))}
          </div>
          <button onClick={refreshAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-ui-blue"><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {activeTab === 'users' && (
            <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">User</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Role</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.isBanned && user.banDetails?.type === 'permanent' && user.banDetails.scheduledDeletionAt && (
                                <p className="text-[10px] text-red-600 font-bold mt-1">
                                    Autodelete: {new Date(user.banDetails.scheduledDeletionAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm">{user.role}</td>
                    <td className="px-6 py-4">
                        {user.isBanned ? (
                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${user.banDetails?.type === 'permanent' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                               <Ban size={12} /> {user.banDetails?.type === 'permanent' ? 'Perm Banned' : 'Suspended'}
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100">
                               <CheckCircle size={12} /> Active
                           </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {user.role !== 'admin' && (
                            <>
                                <button
                                    onClick={() => handleBanClick(user)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${user.isBanned ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'}`}
                                >
                                    {user.isBanned ? 'Lift Ban' : 'Ban User'}
                                </button>
                                {user.isBanned && user.banDetails?.type === 'permanent' && (
                                    <button 
                                        onClick={(e) => handleForceDelete(user.id, e)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                        Force Delete
                                    </button>
                                )}
                            </>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        
        {activeTab === 'security' && (
            <div className="relative">
                <div 
                    ref={logsContainerRef}
                    onScroll={handleLogScroll}
                    className="bg-gray-900 text-green-400 font-mono text-xs p-4 h-[600px] overflow-y-auto scrollbar-hide"
                >
                    {securityLogs.length === 0 && <p className="text-gray-500 italic">No security events logged.</p>}
                    {securityLogs.map((log) => (
                        <div key={log.id} className="mb-1 border-b border-gray-800 pb-1 break-all hover:bg-white/5 transition-colors">
                            <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={`font-bold mr-2 ${
                                log.level === 'CRITICAL' ? 'text-red-500' :
                                log.level === 'HIGH' ? 'text-orange-500' :
                                log.level === 'MEDIUM' ? 'text-yellow-500' :
                                'text-blue-400'
                            }`}>
                                {log.level}
                            </span>
                            <span>{log.message}</span>
                        </div>
                    ))}
                </div>
                {!autoScroll && (
                    <button 
                        onClick={() => {
                            if (logsContainerRef.current) {
                                logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                                setAutoScroll(true);
                            }
                        }}
                        className="absolute bottom-4 right-4 bg-ui-blue text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors animate-bounce"
                    >
                        <ArrowDown size={20} />
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

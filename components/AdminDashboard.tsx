
import React, { useState, useEffect, useRef } from 'react';
import { MockBackend } from '../services/mockBackend';
import { User, AdTier } from '../types';
import { Ban, CheckCircle, ShieldAlert, User as UserIcon, DollarSign, Activity, Lock, Trash2, AlertOctagon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'security'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [adTiers, setAdTiers] = useState<AdTier[]>([]);
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
    refreshAllData();
  }, []);

  // Separate interval for logs (high frequency) vs users (low frequency)
  useEffect(() => {
    const logInterval = setInterval(() => {
      setSecurityLogs(MockBackend.getSecurityLogs());
    }, 1000); // Update logs every second

    const userInterval = setInterval(() => {
       // Only refresh users if we are on the users tab to save performance
       if (activeTab === 'users') {
           setUsers(MockBackend.getAllUsers());
       }
    }, 5000); // Update users every 5 seconds

    return () => {
      clearInterval(logInterval);
      clearInterval(userInterval);
    };
  }, [activeTab]);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'security') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [securityLogs, activeTab]);

  const refreshAllData = () => {
    setUsers(MockBackend.getAllUsers());
    setAdTiers(MockBackend.getAdTiers());
    setSecurityLogs(MockBackend.getSecurityLogs());
  };

  const toggleBan = (userId: string, currentStatus: boolean) => {
    if (currentStatus) {
      MockBackend.unbanUser(userId);
      toast.success("User unbanned");
    } else {
      MockBackend.banUser(userId);
      toast.error("User banned for fraud");
    }
    setUsers(MockBackend.getAllUsers());
  };

  const handlePriceUpdate = (id: string, newPrice: number) => {
    try {
        MockBackend.updateAdTier(id, newPrice);
        setAdTiers(MockBackend.getAdTiers()); // Refresh only after update
        toast.success("Ad Price Updated");
    } catch (e: any) {
        toast.error(e.message);
    }
  };
  
  const clearLogs = () => {
    MockBackend.clearSecurityLogs();
    setSecurityLogs([]);
    toast.success("Security logs purged");
  };

  const highRiskCount = users.filter(u => (u.securityAlerts || 0) > 3).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <UserIcon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                <ShieldAlert size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">High Risk Accounts</p>
                <p className="text-2xl font-bold">{highRiskCount}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Activity size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">System Status</p>
                <p className="text-lg font-bold text-green-600">Operational</p>
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('users')} 
                className={`px-4 py-2 font-medium text-sm rounded-md transition-all ${activeTab === 'users' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Users & Fraud
            </button>
            <button 
                onClick={() => setActiveTab('ads')} 
                className={`px-4 py-2 font-medium text-sm rounded-md transition-all ${activeTab === 'ads' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Ad Pricing
            </button>
            <button 
                onClick={() => setActiveTab('security')} 
                className={`px-4 py-2 font-medium text-sm rounded-md transition-all ${activeTab === 'security' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Security Logs
            </button>
          </div>
          
          <button onClick={refreshAllData} className="flex items-center gap-2 text-sm text-gray-600 hover:text-ui-blue">
            <RefreshCw size={14} /> Refresh Data
          </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {activeTab === 'users' && (
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">User Identity</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Role</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Wallet</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Risk Score</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.matricNumber && <p className="text-[10px] text-gray-400">Matric: {user.matricNumber}</p>}
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`capitalize px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : user.role === 'seller' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                        {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                        ₦{user.walletBalance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                       {(user.securityAlerts || 0) > 3 ? (
                           <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-1 rounded"><AlertOctagon size={14}/> High Risk</span>
                       ) : (
                           <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14}/> Safe</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                        {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100">
                            <Ban size={12} /> Banned
                        </span>
                        ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100">
                            <CheckCircle size={12} /> Active
                        </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                        <button
                            onClick={() => toggleBan(user.id, user.isBanned)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            user.isBanned 
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200' 
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                            }`}
                        >
                            {user.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}

        {activeTab === 'ads' && (
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Monetization Settings</h3>
                    <p className="text-sm text-gray-500">Configure pricing tiers for seller advertisements.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {adTiers.map(tier => (
                        <div key={tier.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white relative group">
                            <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-xl ${tier.id === 'gold' ? 'bg-yellow-400' : tier.id === 'silver' ? 'bg-gray-400' : 'bg-orange-400'}`}></div>
                            <div className="flex justify-between items-center mb-4 mt-2">
                                <h3 className="text-xl font-bold capitalize text-gray-800">{tier.name}</h3>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                                    {tier.durationDays} Days
                                </span>
                            </div>
                            <div className="space-y-4">
                                <ul className="text-sm text-gray-600 space-y-2">
                                    {tier.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> {f}</li>
                                    ))}
                                </ul>
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Price (₦)</label>
                                    <input 
                                        type="number" 
                                        defaultValue={tier.price}
                                        onBlur={(e) => handlePriceUpdate(tier.id, parseInt(e.target.value))}
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 font-mono text-lg font-bold focus:border-ui-blue outline-none transition-colors"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 italic">Click outside to save changes</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'security' && (
            <div className="flex flex-col h-[600px]">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <Lock size={16} /> Live Security Audit Stream
                        <span className="flex items-center gap-1.5 ml-4 text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Monitoring Active
                        </span>
                    </div>
                    <button onClick={clearLogs} className="text-xs flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100 transition-all">
                        <Trash2 size={12} /> Clear Logs
                    </button>
                </div>
                <div className="flex-grow p-6 bg-[#0d1117] text-gray-300 font-mono text-xs overflow-y-auto custom-scrollbar">
                    {securityLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <ShieldAlert size={48} className="mb-4" />
                            <p>No threats detected.</p>
                        </div>
                    ) : (
                        securityLogs.map((log, i) => (
                            <div key={i} className={`mb-2 pl-3 border-l-2 leading-relaxed ${
                                log.includes('[CRITICAL]') ? 'border-red-500 text-red-400 bg-red-900/10 py-1' : 
                                log.includes('[HIGH]') ? 'border-orange-500 text-orange-400' : 
                                log.includes('[MEDIUM]') ? 'border-yellow-500 text-yellow-300' : 
                                'border-green-500 text-green-400'
                            }`}>
                                {log}
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

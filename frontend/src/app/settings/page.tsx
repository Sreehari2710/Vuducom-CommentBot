'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Unlock, Save, Loader2, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface UserData {
  name: string;
  email: string;
  instaCookies?: string;
}

export default function SettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cookies, setCookies] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUserData(response.data);
      setCookies(response.data.instaCookies || '');
      setIsLocked(!!response.data.instaCookies);
    } catch (err: any) {
      console.error('Failed to fetch user data:', err);
      // Redirect to signin if unauthorized
      window.location.href = '/signin';
    }
  };

  const handleSaveCookies = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/user/cookies', { cookies });
      setMessage('Instagram session updated successfully');
      setIsLocked(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update cookies');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and Instagram authentication</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="pro-card p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Account Profile
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Full Name</label>
                  <div className="pro-input bg-slate-900/50 flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-300">{userData.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Email Address</label>
                  <div className="pro-input bg-slate-900/50 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-300">{userData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pro-card p-6 border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Instagram Authentication
              </h2>
              {isLocked ? (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3" />
                  Authenticated
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
                  Action Required
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Session Cookies (JSON)</label>
                  <button 
                    onClick={() => setIsLocked(!isLocked)}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {isLocked ? <><Unlock className="w-3 h-3" /> Edit Session</> : <><Lock className="w-3 h-3" /> Lock Editor</>}
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    disabled={isLocked}
                    className={`pro-input h-48 font-mono text-[11px] custom-scrollbar transition-all ${isLocked ? 'opacity-50 blur-[2px] cursor-not-allowed select-none' : 'opacity-100'}`}
                    placeholder='[{"name": "sessionid", "value": "..."}]'
                    value={cookies}
                    onChange={(e) => setCookies(e.target.value)}
                  />
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2 shadow-xl">
                        <Lock className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-white">Editor Locked</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(message || error) && (
                <div className={`p-3 rounded-md text-xs font-medium flex items-center gap-2 ${message ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {message ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message || error}
                </div>
              )}

              <button
                disabled={isLocked || isLoading}
                onClick={handleSaveCookies}
                className="pro-button w-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Instagram Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="pro-card p-6">
            <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-widest">Setup Guide</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">1. Export Cookies</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Use an extension like "EditThisCookie" to export your Instagram session in JSON format.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">2. Paste Payload</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Paste the entire JSON array into the editor above.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">3. Encrypted Sync</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Your session is encrypted with AES-256 before being stored in our vault.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

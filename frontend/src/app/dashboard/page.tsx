'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Activity,
  MessageCircle,
  MessageSquareText
} from 'lucide-react';
import api from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  type: string;
  delay: number;
  createdAt: string;
  _count: {
    interactions: number;
  };
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'interactions'>('date');

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err);
      // If the request fails, it's likely a session issue
      if (err.response?.status === 401 || err.response?.status === 403) {
        window.location.href = '/signin';
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'interactions') return b._count.interactions - a._count.interactions;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredCampaigns = sortedCampaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-slate-400 mt-1">Manage and monitor your automated interactions</p>
        </div>
        <Link 
          href="/campaigns/new" 
          className="pro-button bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Active Campaigns', value: campaigns.length, icon: Activity, color: 'text-indigo-400' },
          { label: 'Total Interactions', value: campaigns.reduce((acc, c) => acc + c._count.interactions, 0), icon: BarChart3, color: 'text-emerald-400' },
          { label: 'Average Delay', value: `${campaigns.length ? Math.round(campaigns.reduce((acc, c) => acc + c.delay, 0) / campaigns.length) : 0}s`, icon: Clock, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="pro-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-slate-900 border border-slate-800 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="pro-card overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="pro-input pl-10 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Sort By
            </span>
            <select 
              className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">Newest First</option>
              <option value="name">Alphabetical</option>
              <option value="interactions">Most Links</option>
            </select>
            <div className="h-4 w-px bg-slate-800 mx-2" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Showing {filteredCampaigns.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Interactions</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-32" /></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-20" /></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-16" /></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                    <td className="px-6 py-6 text-right"><div className="h-4 bg-slate-800 rounded w-10 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-10 h-10 text-slate-700 mb-4" />
                      <p className="text-slate-400 font-medium">No results match your search</p>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-indigo-400 text-sm mt-1 hover:underline">Clear search</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${
                          campaign.type === 'DM' 
                            ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          {campaign.type === 'DM' ? <MessageSquareText className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{campaign.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {campaign.type === 'DM' ? 'Direct Message' : 'Comment Bot'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {campaign._count.interactions} links
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/campaigns/${campaign.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-slate-700"
                      >
                        View Details
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

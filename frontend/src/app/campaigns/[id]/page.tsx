'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageCircle, 
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Copy,
  Activity
} from 'lucide-react';
import api from '@/lib/api';

interface Interaction {
  id: string;
  link: string;
  comment: string;
  status: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  delay: number;
  createdAt: string;
  interactions: Interaction[];
}

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaignDetails = async () => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      setCampaign(response.data);
    } catch (err: any) {
      console.error('Failed to fetch campaign details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetails();
    const interval = setInterval(fetchCampaignDetails, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm font-medium">Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white">Campaign not found</h1>
        <button onClick={() => router.back()} className="text-indigo-400 mt-2 hover:underline flex items-center gap-2 justify-center mx-auto">
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  const successCount = campaign.interactions.filter(i => i.status === 'SUCCESS').length;
  const failureCount = campaign.interactions.filter(i => i.status === 'FAILURE').length;
  const pendingCount = campaign.interactions.filter(i => i.status === 'PENDING' || i.status === 'PROCESSING').length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{campaign.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Campaign Details</span>
              <div className="w-1 h-1 bg-slate-700 rounded-full" />
              <span className="text-xs text-slate-500">{new Date(campaign.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="pro-card px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">{campaign.delay}s delay</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: campaign.interactions.length, icon: Activity, color: 'text-white' },
          { label: 'Success', value: successCount, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Failed', value: failureCount, icon: XCircle, color: 'text-red-400' },
          { label: 'Remaining', value: pendingCount, icon: Clock, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="pro-card p-4 flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactions Table */}
      <div className="pro-card overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Interaction Log
          </h2>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">
            Real-time updates enabled
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instagram Link</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comment Payload</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Update</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {campaign.interactions.map((interaction) => (
                <tr key={interaction.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 group">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-sm text-slate-300 max-w-[180px] truncate">{interaction.link}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-sm text-slate-400 italic">"{interaction.comment}"</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {interaction.status === 'SUCCESS' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                        Success
                      </span>
                    )}
                    {interaction.status === 'FAILURE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wide">
                        Failed
                      </span>
                    )}
                    {interaction.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700 uppercase tracking-wide">
                        Pending
                      </span>
                    )}
                    {interaction.status === 'PROCESSING' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {new Date(interaction.updatedAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => window.open(interaction.link, '_blank')}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

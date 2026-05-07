'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  SendHorizontal, 
  Loader2, 
  Clock, 
  Link as LinkIcon, 
  MessageCircle, 
  Type,
  Activity,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  MessageSquareText,
  MousePointer2
} from 'lucide-react';
import api from '@/lib/api';

type BotType = 'COMMENT' | 'DM';

export default function NewCampaignPage() {
  const [botType, setBotType] = useState<BotType | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [delay, setDelay] = useState(30);
  const [links, setLinks] = useState('');
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botType) return;
    
    setError('');
    setIsLoading(true);

    try {
      const linkArr = links.split('\n').filter(l => l.trim());
      let interactionData;

      if (botType === 'COMMENT') {
        const commentArr = comments.split('\n').filter(c => c.trim());
        if (linkArr.length === 0) throw new Error('At least one Instagram link is required');
        if (commentArr.length === 0) throw new Error('At least one comment is required');
        interactionData = { links: linkArr, comments: commentArr };
      } else {
        if (linkArr.length === 0) throw new Error('At least one Profile URL is required');
        if (!message.trim()) throw new Error('A message is required');
        
        // Extract usernames for DM bot
        const usernames = linkArr.map(url => {
          const match = url.match(/instagram\.com\/([^/?#]+)/);
          return match ? match[1] : url.trim();
        });

        interactionData = { 
          links: linkArr, // Keeping the URLs for reference
          comments: [message.trim()], // Saving message in comments field for now
          usernames // Extra data
        };
      }

      const response = await api.post('/campaigns', {
        name: campaignName,
        type: botType,
        delay,
        interactions: interactionData
      });

      router.push(`/campaigns/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create campaign');
      setIsLoading(false);
    }
  };

  if (!botType) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight">Choose your Bot</h1>
          <p className="text-slate-400 mt-2">Select the automation type for your new campaign</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <button 
            onClick={() => setBotType('COMMENT')}
            className="pro-card p-8 flex flex-col items-center text-center group hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
          >
            <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Comment Bot</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Automate comments on multiple Instagram posts using a pool of rotating messages.
            </p>
          </button>

          <button 
            onClick={() => setBotType('DM')}
            className="pro-card p-8 flex flex-col items-center text-center group hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
          >
            <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <MessageSquareText className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">DM Bot</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Send direct messages to multiple Instagram profiles with customized delays.
            </p>
          </button>
        </div>
      </div>
    );
  }

  const linkCount = links.split('\n').filter(l => l.trim()).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <button 
          onClick={() => setBotType(null)}
          className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            New {botType === 'COMMENT' ? 'Comment' : 'DM'} Bot
          </h1>
          <p className="text-slate-400 mt-1">Configure your automated Instagram sequence</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="pro-card p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Campaign Identity</h2>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Name</label>
                <input 
                  type="text" 
                  required
                  placeholder={`e.g., ${botType === 'COMMENT' ? 'Engagement' : 'Outreach'} 2024`}
                  className="pro-input"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {botType === 'COMMENT' ? 'Target Posts' : 'Target Profiles'}
                  </h2>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    {botType === 'COMMENT' ? 'Post URLs' : 'Profile URLs'}
                    <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{linkCount} items</span>
                  </label>
                  <textarea 
                    required
                    placeholder={`https://instagram.com/${botType === 'COMMENT' ? 'p/...' : 'username/'}`}
                    className="pro-input h-40 resize-none font-mono text-xs"
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-600">Enter one URL per line</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {botType === 'COMMENT' ? 'Comment Pool' : 'Message'}
                  </h2>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    {botType === 'COMMENT' ? 'Message Variations' : 'Single Message'}
                  </label>
                  {botType === 'COMMENT' ? (
                    <textarea 
                      required
                      placeholder="Amazing post! 🔥"
                      className="pro-input h-40 resize-none text-xs"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  ) : (
                    <textarea 
                      required
                      placeholder="Hello! I loved your recent content..."
                      className="pro-input h-40 resize-none text-sm"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  )}
                  <p className="text-[10px] text-slate-600">
                    {botType === 'COMMENT' 
                      ? 'One variation per line. Randomly selected for each post.' 
                      : 'This exact message will be sent to all profile usernames extracted above.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="pro-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  Interval Delay
                  <span className="text-indigo-400 font-bold">{delay}s</span>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="300" 
                  step="5"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                  <span>FAST (5s)</span>
                  <span>SAFE (300s)</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`pro-button w-full flex items-center justify-center gap-2 group shadow-xl ${
                  botType === 'COMMENT' 
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Initialize {botType === 'COMMENT' ? 'Commenter' : 'Messenger'}
                    <SendHorizontal className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

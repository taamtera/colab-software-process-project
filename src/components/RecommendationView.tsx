'use client';

import React from 'react';
import { SoftwareHouseProfile, TORContract } from '@/types';
import { TORCard } from './TORCard';
import { 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Bell, 
  TrendingUp, 
  CheckCircle2,
  Edit3
} from 'lucide-react';

interface RecommendationViewProps {
  currentUser: SoftwareHouseProfile;
  contracts: TORContract[];
  onSelectContract: (contract: TORContract) => void;
  onEditProfile: () => void;
  onToggleNotifications: () => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  currentUser,
  contracts,
  onSelectContract,
  onEditProfile,
  onToggleNotifications
}) => {
  const recommendedContracts = [...contracts].sort(
    (a, b) => (b.matchedScore || 0) - (a.matchedScore || 0)
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Section matching Desktop - data right side wireframe: User info & property container */}
      <div className="theme-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          
          {/* Avatar circle + username */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-sky-500/40 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-sky-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                  username: <span className="text-sky-600 dark:text-sky-400">{currentUser.name}</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Verified Software House
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.companyName} ({currentUser.companySize})</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-500 dark:text-slate-400">{currentUser.district}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleNotifications}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                currentUser.notificationsEnabled
                  ? 'bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Bell className={`w-4 h-4 ${currentUser.notificationsEnabled ? 'text-sky-600 dark:text-sky-400' : ''}`} />
              <span>{currentUser.notificationsEnabled ? 'Notifications Active' : 'Notifications Muted'}</span>
            </button>

            <button
              onClick={onEditProfile}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Edit Property Data</span>
            </button>
          </div>
        </div>

        {/* property box matching wireframe 'property' */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>property (Verified Qualifications & Capabilities)</span>
            </h3>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono">
              Vertex AI Engine Verified
            </span>
          </div>

          {/* Render property items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {currentUser.properties.map((prop, idx) => (
              <div 
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight font-medium">{prop}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recommendation Section Header matching Desktop - data */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Recommendation <span className="text-xs text-sky-600 dark:text-sky-400 font-medium font-mono">(Vertex AI Matched TOR Contracts)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                สัญญาจ้าง TOR ที่ตรงกับคุณสมบัติบริษัทของคุณมากที่สุด จัดอันดับด้วย Vertex AI (FR16 / US7)
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Highest Match Score First</span>
          </div>
        </div>

        {/* Recommended TOR List Cards */}
        <div className="space-y-4">
          {recommendedContracts.map((contract) => (
            <TORCard
              key={contract.id}
              contract={contract}
              onSelect={onSelectContract}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

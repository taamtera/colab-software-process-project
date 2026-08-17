'use client';

import React from 'react';
import { 
  Cpu, 
  FileCheck, 
  TrendingUp, 
  Bot, 
  Search, 
  RefreshCw
} from 'lucide-react';

interface DashboardHeroProps {
  totalTORs: number;
  totalBudgetFormatted: string;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onTriggerAICrawl: () => void;
  isCrawling: boolean;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  totalTORs,
  totalBudgetFormatted,
  onSearchChange,
  searchQuery,
  onTriggerAICrawl,
  isCrawling
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl theme-card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
      
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Banner Left Info */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <Bot className="w-3.5 h-3.5" />
            <span>Vertex AI Engine Active • Bangkok TOR Aggregator</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
            Dash board <span className="text-sky-600 dark:text-sky-400">TOR Software</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            ศูนย์รวมและประเมินคุณสมบัติ TOR ภาครัฐในกรุงเทพมหานคร สำหรับ Software House & Freelancers 
            วิเคราะห์ความเหมาะสมด้วยปัญญาประดิษฐ์ Vertex AI อัตโนมัติ
          </p>

          {/* Quick Search Input */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาชื่อสัญญา TOR, หน่วยงานผู้ประกาศ, หรือคุณสมบัติ..."
              className="w-full pl-10 pr-32 py-2.5 theme-input rounded-xl text-sm placeholder-slate-400"
            />
            <button 
              onClick={onTriggerAICrawl}
              disabled={isCrawling}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? 'Crawling...' : 'AI Crawl BKK'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active TORs</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{totalTORs} <span className="text-xs font-normal text-slate-500">contracts</span></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Value</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{totalBudgetFormatted}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3 col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vertex AI Match</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">98.4% <span className="text-xs font-normal text-slate-500">accuracy</span></p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

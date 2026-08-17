'use client';

import React from 'react';
import { FilterState } from '@/types';
import { BANGKOK_DISTRICTS, TOR_CATEGORIES } from '@/data/mockData';
import { SlidersHorizontal, ChevronDown, Search, RefreshCw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  resultCount: number;
  onTriggerAICrawl?: () => void;
  isCrawling?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  onResetFilters,
  resultCount,
  onTriggerAICrawl,
  isCrawling = false
}) => {
  return (
    <div className="theme-card p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Search Bar at Top */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="ค้นหาชื่อสัญญา TOR, หน่วยงานผู้ประกาศ, หรือคุณสมบัติ..."
            className="w-full pl-10 pr-32 py-2.5 theme-input rounded-xl text-sm placeholder-slate-400"
          />
          {onTriggerAICrawl && (
            <button 
              onClick={onTriggerAICrawl}
              disabled={isCrawling}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? 'Crawling...' : 'AI Crawl'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            ตัวกรองค้นหา TOR (2x2 Filters)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            พบ <span className="text-slate-700 dark:text-slate-200 font-bold">{resultCount}</span> รายการ
          </span>
          <button
            onClick={onResetFilters}
            className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline transition-colors"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </div>

      {/* 2x2 Grid Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Dropdown 1: Category Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            หมวดหมู่ TOR (Category)
          </label>
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full appearance-none theme-input rounded-xl px-4 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-10"
            >
              {TOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Dropdown 2: Price / Budget Range */}
        <div className="relative">
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            ช่วงงบประมาณ (Price Range)
          </label>
          <div className="relative">
            <select
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full appearance-none theme-input rounded-xl px-4 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-10"
            >
              <option value={50000000} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ทั้งหมด (ทุกระดับงบประมาณ)</option>
              <option value={5000000} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ไม่เกิน 5,000,000 THB</option>
              <option value={15000000} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ไม่เกิน 15,000,000 THB</option>
              <option value={30000000} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ไม่เกิน 30,000,000 THB</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Dropdown 3: Bangkok District / Location */}
        <div className="relative">
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            เขตพื้นที่ในกรุงเทพฯ (Bangkok District)
          </label>
          <div className="relative">
            <select
              value={filters.district}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
              className="w-full appearance-none theme-input rounded-xl px-4 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-10"
            >
              {BANGKOK_DISTRICTS.map((dist) => (
                <option key={dist} value={dist} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {dist}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Dropdown 4: AI Match score */}
        <div className="relative">
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            ระดับ AI Compatibility Match %
          </label>
          <div className="relative">
            <select
              value={filters.minMatchScore}
              onChange={(e) => setFilters(prev => ({ ...prev, minMatchScore: Number(e.target.value) }))}
              className="w-full appearance-none theme-input rounded-xl px-4 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-10"
            >
              <option value={0} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ทุกระดับคะแนนความเข้ากันได้</option>
              <option value={90} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">AI Match สูงมาก (&gt; 90%)</option>
              <option value={80} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">AI Match ปานกลาง (&gt; 80%)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { 
  Building2, 
  Sparkles, 
  LogOut, 
  Bell, 
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { SoftwareHouseProfile } from '@/types';

interface HeaderProps {
  activeTab: 'dashboard' | 'recommendations' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'recommendations' | 'profile') => void;
  currentUser: SoftwareHouseProfile | null;
  onOpenAuth: (mode: 'login' | 'signin') => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  notificationCount: number;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenProfile,
  notificationCount,
  themeMode,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand / Logo — keep blue on logo icon only */}
        <div className="flex items-center gap-2 cursor-pointer " onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
            <svg 
              className="w-10 font-black tracking-tighter" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://w3.org"
            >
              <text 
                x="38%" 
                y="55%" 
                dominantBaseline="middle" 
                textAnchor="middle"
                fill="currentColor" 
                className="text-[12px] font-sans font-black italic tracking-tight"
              >
                BK
              </text>
                            <text 
                x="76%" 
                y="55%" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                fill="currentColor" 
                className="text-[12px] font-sans font-black italic tracking-tight"
              >
                T
              </text>
</svg>
          </div>
          <div>
            <div className="flex-1 items-center gap-2 w-max">
              <span className="font-bold text-base md:text-lg text-slate-900 dark:text-white tracking-tight">
                Bangkok TOR<span className="text-slate-600 dark:text-slate-300"> Intelligence</span>
              </span>
              <span className="flex-none px-2 py-0.5 w-[100px] text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full">
                Vertex AI
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">Bangkok TOR Discovery, Evaluation & Matching</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dash board</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all relative ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Recommendation</span>
            {notificationCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (currentUser) {
                onOpenProfile();
              } else {
                onOpenAuth('login');
              }
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Profile</span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Toggle Light/Dark Theme"
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button 
                onClick={() => setActiveTab('recommendations')}
                className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                title="AI Match Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-slate-600 dark:bg-slate-300 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* User Profile Pill */}
              <div 
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.companyName} 
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                    {currentUser.companyName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Software House</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-all"
              >
                log in
              </button>
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all"
              >
                sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base md:text-lg text-slate-900 dark:text-white tracking-tight">
                Bangkok <span className="text-sky-600 dark:text-sky-400">TOR Intelligence</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-full">
                Vertex AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Bangkok TOR Discovery, Evaluation & Matching</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dash board</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Recommendation</span>
            {notificationCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-sky-600 text-white rounded-full">
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
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Profile</span>
          </button>
        </nav>

        {/* Right side controls: Theme Toggle, Notifications, Auth */}
        <div className="flex items-center gap-3">
          
          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Toggle Light/Dark Theme"
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notifications Button */}
              <button 
                onClick={() => setActiveTab('recommendations')}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                title="AI Match Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-sky-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* User Profile Pill */}
              <div 
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.companyName} 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-sky-500/40"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                    {currentUser.companyName}
                  </p>
                  <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">Software House</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl transition-all"
              >
                log in
              </button>
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
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

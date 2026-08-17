'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  SoftwareHouseProfile, 
  TORContract, 
  FilterState 
} from '@/types';
import { 
  INITIAL_SOFTWARE_HOUSE, 
  MOCK_TOR_CONTRACTS 
} from '@/data/mockData';
import { Header } from '@/components/Header';
import { DashboardHero } from '@/components/DashboardHero';
import { FilterBar } from '@/components/FilterBar';
import { TORCard } from '@/components/TORCard';
import { TORDetailModal } from '@/components/TORDetailModal';
import { AuthModal } from '@/components/AuthModal';
import { SoftwareHouseProfileModal } from '@/components/SoftwareHouseProfileModal';
import { RecommendationView } from '@/components/RecommendationView';
import { NotificationToast } from '@/components/NotificationToast';
import { 
  Sparkles, 
  Layers, 
  Bot, 
  CheckCircle2, 
  Search
} from 'lucide-react';

export default function Home() {
  // Theme state ('light' by default for easy on the eyes, or toggleable to 'dark')
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Sync theme mode class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State Management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recommendations' | 'profile'>('dashboard');
  const [currentUser, setCurrentUser] = useState<SoftwareHouseProfile | null>(INITIAL_SOFTWARE_HOUSE);
  const [contracts, setContracts] = useState<TORContract[]>(MOCK_TOR_CONTRACTS);
  const [selectedContract, setSelectedContract] = useState<TORContract | null>(null);
  
  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signin'>('login');

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All Categories',
    district: 'All Districts',
    minPrice: 0,
    maxPrice: 50000000,
    minMatchScore: 0,
    status: 'All'
  });

  // Crawler & Notification state
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<TORContract | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(1);

  // Recalculate contract match scores whenever currentUser properties change
  useEffect(() => {
    if (!currentUser) return;

    setContracts(prevContracts => 
      prevContracts.map(contract => {
        let matchedCount = 0;
        const updatedProps = contract.properties.map(req => {
          const isFulfilled = currentUser.properties.some(userProp => 
            userProp.toLowerCase().includes(req.category.toLowerCase()) ||
            userProp.toLowerCase().includes('iso') ||
            userProp.toLowerCase().includes('react') ||
            userProp.toLowerCase().includes('cloud') ||
            userProp.toLowerCase().includes('api') ||
            userProp.toLowerCase().includes('big data')
          );
          if (isFulfilled) matchedCount++;
          return { ...req, fulfilledBySoftwareHouse: isFulfilled };
        });

        const matchPercentage = Math.min(
          99,
          Math.max(65, Math.round((matchedCount / contract.properties.length) * 40 + 58))
        );

        return {
          ...contract,
          properties: updatedProps,
          matchedScore: matchPercentage
        };
      })
    );
  }, [currentUser?.properties]);

  // Filtered TOR Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = contract.title.toLowerCase().includes(query);
        const matchesOwner = contract.contractOwner.toLowerCase().includes(query);
        const matchesDesc = contract.description.toLowerCase().includes(query);
        const matchesProps = contract.properties.some(p => p.property.toLowerCase().includes(query));
        if (!matchesTitle && !matchesOwner && !matchesDesc && !matchesProps) return false;
      }

      if (filters.category !== 'All Categories' && contract.category !== filters.category) {
        return false;
      }

      if (filters.district !== 'All Districts' && contract.district !== filters.district) {
        return false;
      }

      if (filters.maxPrice > 0 && contract.price > filters.maxPrice) {
        return false;
      }

      if (filters.minMatchScore > 0 && (contract.matchedScore || 0) < filters.minMatchScore) {
        return false;
      }

      return true;
    });
  }, [contracts, filters]);

  // Total budget volume formatted
  const totalBudgetFormatted = useMemo(() => {
    const total = contracts.reduce((acc, curr) => acc + curr.price, 0);
    return `${(total / 1000000).toFixed(1)}M THB`;
  }, [contracts]);

  // Handlers
  const handleOpenAuth = (mode: 'login' | 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All Categories',
      district: 'All Districts',
      minPrice: 0,
      maxPrice: 50000000,
      minMatchScore: 0,
      status: 'All'
    });
  };

  const handleTriggerAICrawl = () => {
    setIsCrawling(true);
    setTimeout(() => {
      setIsCrawling(false);
      if (contracts.length > 0) {
        setActiveNotification(contracts[0]);
      }
    }, 2000);
  };

  const handleDownloadPDF = (contract: TORContract) => {
    const textContent = `
============================================================
ข้อกำหนดรายละเอียดและขอบเขตของงาน (TOR)
${contract.title}
============================================================
ผู้ออกเอกสาร: ${contract.contractOwner}
เขตพื้นที่: ${contract.district}, กรุงเทพมหานคร
วงเงินงบประมาณ: ${contract.priceFormatted}
ระยะเวลาสัญญา: ${contract.startDate} ถึง ${contract.endDate}
กำหนดวันยื่นเอกสาร: ${contract.submissionDeadline}

วัตถุประสงค์:
${contract.description}

คุณสมบัติของผู้เสนอราคา (Vertex AI Evaluated):
${contract.properties.map((p, i) => `${i + 1}. ${p.property}`).join('\n')}

วิเคราะห์โดย Vertex AI:
- คะแนนความเหมาะสม: ${contract.aiEvaluation.qualificationMatchScore}%
- ประเมินงบประมาณ: ${contract.aiEvaluation.priceAssessment}
- ระดับความเสี่ยง: ${contract.aiEvaluation.riskLevel} (${contract.aiEvaluation.riskAnalysis})

ดาวน์โหลดจาก Bangkok TOR Intelligence Platform (2026)
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contract.id}_TOR_Specification.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileModalOpen(true)}
        notificationCount={notificationCount}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: DASHBOARD TAB (Desktop - 1) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Banner Section (Dash board) */}
            <DashboardHero
              totalTORs={contracts.length}
              totalBudgetFormatted={totalBudgetFormatted}
              onSearchChange={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
              searchQuery={filters.searchQuery}
              onTriggerAICrawl={handleTriggerAICrawl}
              isCrawling={isCrawling}
            />

            {/* 2x2 Filter Dropdowns */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onResetFilters={handleResetFilters}
              resultCount={filteredContracts.length}
            />

            {/* TOR Contract Cards Listing */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <span>รายการสัญญา TOR ทั้งหมดในกรุงเทพฯ ({filteredContracts.length})</span>
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  คลิกที่การ์ดเพื่อเปิด <strong className="text-sky-600 dark:text-sky-400">Desktop - 2 (PDF Reader)</strong>
                </span>
              </div>

              {filteredContracts.length > 0 ? (
                <div className="space-y-4">
                  {filteredContracts.map((contract) => (
                    <TORCard
                      key={contract.id}
                      contract={contract}
                      onSelect={(c) => setSelectedContract(c)}
                    />
                  ))}
                </div>
              ) : (
                <div className="theme-card p-8 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">ไม่พบรายการ TOR ที่ตรงกับตัวกรอง</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">ลองปรับลดเงื่อนไข หรือกดล้างตัวกรองเพื่อดูรายการทั้งหมด</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-sky-600 dark:text-sky-400 text-xs font-semibold rounded-xl transition-all"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: RECOMMENDATION TAB (Desktop - data) */}
        {activeTab === 'recommendations' && (
          currentUser ? (
            <RecommendationView
              currentUser={currentUser}
              contracts={contracts}
              onSelectContract={(c) => setSelectedContract(c)}
              onEditProfile={() => setProfileModalOpen(true)}
              onToggleNotifications={() => {
                setCurrentUser(prev => prev ? { ...prev, notificationsEnabled: !prev.notificationsEnabled } : null);
              }}
            />
          ) : (
            <div className="theme-card p-10 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 my-8 shadow-sm">
              <Bot className="w-16 h-16 text-sky-600 dark:text-sky-400 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">เข้าสู่ระบบเพื่อเปิดใช้งาน AI Recommendation</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
                ลงทะเบียนหรือเข้าสู่ระบบบัญชี Software House เพื่อวิเคราะห์คุณสมบัติบริษัทและรับคำแนะนำ TOR แบบเฉพาะบุคคล
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm text-sm transition-all"
              >
                log in / sign in เข้าสู่ระบบ
              </button>
            </div>
          )
        )}

        {/* VIEW 3: PROFILE TAB (Desktop - data profile) */}
        {activeTab === 'profile' && (
          currentUser ? (
            <div className="theme-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img src={currentUser.avatar} alt={currentUser.companyName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-500/50" />
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentUser.companyName}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tax ID: {currentUser.taxId} • {currentUser.district}</p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  แก้ไขข้อมูลคุณสมบัติ (Edit Desktop - data)
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  คุณสมบัติที่ได้รับการรับรอง (property list)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentUser.properties.map((prop, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span>{prop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <button onClick={() => handleOpenAuth('login')} className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl">
                Log In / Sign In
              </button>
            </div>
          )
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 mt-12 bg-white dark:bg-slate-950 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Bangkok TOR Intelligence Software Platform</span>
          </div>
          <p>© 2026 Software Requirement Specification & Technical Design Mockup.</p>
        </div>
      </footer>

      {/* MODAL 1: TOR Detail & PDF Reader (Desktop - 2) */}
      <TORDetailModal
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* MODAL 2: Auth LogIn / SignIn (Desktop - LogIn & Desktop - SignIn) */}
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      {/* MODAL 3: Software House Profile (Desktop - data form) */}
      {currentUser && (
        <SoftwareHouseProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          currentUser={currentUser}
          onSave={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* Notification Toast Alert */}
      <NotificationToast
        contract={activeNotification}
        onClose={() => setActiveNotification(null)}
        onViewContract={(c) => setSelectedContract(c)}
      />

    </div>
  );
}

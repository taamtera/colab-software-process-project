'use client';

import React, { useState } from 'react';
import { SoftwareHouseProfile } from '@/types';
import { X, Lock, Mail, Building, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'signin';
  onClose: () => void;
  onSuccess: (user: SoftwareHouseProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode: initialMode,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signin'>(initialMode);
  const [email, setEmail] = useState('contact@techbangkok.co.th');
  const [password, setPassword] = useState('••••••••••••');
  const [companyName, setCompanyName] = useState('TechBangkok Solutions Co., Ltd.');
  const [taxId, setTaxId] = useState('0105565012345');
  const [resetMessageSent, setResetMessageSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: SoftwareHouseProfile = {
      id: 'sh-001',
      name: 'Somchai Jaidee',
      email: email,
      companyName: companyName,
      taxId: taxId,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      companySize: '25-50 Employees',
      district: 'Chatuchak, Bangkok',
      properties: [
        'ISO 27001 Information Security Certified',
        'ISO 29110 Software Process Certified',
        'Next.js / React / TypeScript Mastery',
        'Node.js & Microservices Architecture',
        'Cloud Native Infrastructure (GCP / AWS)',
        'Enterprise GIS Integration Experience'
      ],
      technologies: ['Next.js', 'React', 'Node.js', 'Python', 'Docker'],
      certifications: ['ISO 27001', 'ISO 29110'],
      minPreferredBudget: 1000000,
      maxPreferredBudget: 50000000,
      notificationsEnabled: true,
      matchedTORIds: ['tor-001', 'tor-002', 'tor-004']
    };
    onSuccess(mockUser);
    onClose();
  };

  const handleResetPassword = () => {
    setResetMessageSent(true);
    setTimeout(() => setResetMessageSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
        
        {/* Close Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title matching Desktop - LogIn / Desktop - SignIn */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'Desktop - LogIn' : 'Desktop - SignIn'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login' 
              ? 'เข้าสู่ระบบบัญชี Software House เพื่อเข้าถึงการจับคู่ TOR' 
              : 'ลงทะเบียนบริษัท Software House เพื่อรับการแจ้งเตือน TOR ที่ตรงคุณสมบัติ'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signin' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อบริษัท Software House (Company Name)
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="บริษัท เทคบางกอก โซลูชั่นส์ จำกัด"
                    className="w-full pl-10 pr-4 py-2.5 theme-input rounded-xl text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เลขประจำตัวผู้เสียภาษี (Tax ID)
                </label>
                <input
                  type="text"
                  required
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="0105565012345"
                  className="w-full px-4 py-2.5 theme-input rounded-xl text-sm placeholder-slate-400 font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              อีเมลผู้ใช้งาน (Email Address)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@techbangkok.co.th"
                className="w-full pl-10 pr-4 py-2.5 theme-input rounded-xl text-sm placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                รหัสผ่าน (Password)
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                >
                  ลืมรหัสผ่าน? (Reset Password)
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 theme-input rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          {resetMessageSent && (
            <div className="p-3 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-700 dark:text-sky-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
              <span>ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณเรียบร้อยแล้ว (FR9)</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm mt-2"
          >
            {mode === 'login' ? 'เข้าสู่ระบบ (Log In)' : 'สร้างบัญชีผู้ใช้ (Sign In)'}
          </button>
        </form>

        {/* Mode Switcher Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <p>
              ยังไม่มีบัญชี Software House?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Sign In (ลงทะเบียน)
              </button>
            </p>
          ) : (
            <p>
              มีบัญชี Software House อยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Log In (เข้าสู่ระบบ)
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

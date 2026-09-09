'use client';

import React, { useEffect, useState } from 'react';
import { SoftwareHouseProfile } from '@/types';
import { X, Lock, Mail, Building, User, Sparkles, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import * as authApi from '@/lib/authApi';
import { safeUserToProfile } from '@/lib/userProfile';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'signin';
  onClose: () => void;
  onSuccess: (user: SoftwareHouseProfile) => void;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() ?? '';
  return { firstName, lastName: parts.join(' ') || firstName };
}

// Turns a backend error into a clear, bilingual message. Keyed by the API error
// code so the wording stays consistent even if the backend text changes.
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (Incorrect email or password). Please try again.',
  EMAIL_ALREADY_REGISTERED: 'อีเมลนี้ถูกใช้งานแล้ว (This email is already registered). Try logging in instead.',
  ACCOUNT_LOCKED: 'บัญชีถูกล็อกชั่วคราวจากการเข้าสู่ระบบผิดหลายครั้ง กรุณาลองใหม่ภายหลัง (Account temporarily locked after too many attempts — try again later).',
  ACCOUNT_SUSPENDED: 'บัญชีนี้ถูกระงับการใช้งาน (This account has been suspended).',
  COMPANY_ALREADY_REGISTERED: 'เลขประจำตัวผู้เสียภาษีนี้ถูกใช้ลงทะเบียนแล้ว (A company with this Tax ID already exists).',
  NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Cannot reach the server). Please check your connection and try again.',
  INTERNAL_SERVER_ERROR: 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง (Server error — please try again in a moment).'
};

function friendlyAuthError(error: unknown): string {
  if (error instanceof authApi.ApiError) {
    // Validation errors carry a specific, useful message from the server (e.g. which
    // field is wrong) — keep it. Otherwise use our clear mapped message.
    if (error.code === 'VALIDATION_ERROR' && error.message) {
      return error.message;
    }
    return ERROR_MESSAGES[error.code] ?? error.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่ (Something went wrong — please try again).';
  }
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่ (Something went wrong — please try again).';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode: initialMode,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signin'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // The modal component stays mounted (it just renders null when closed), so re-sync
  // to the requested mode each time it opens — otherwise it keeps whatever mode was
  // last used. Clicking "log in" always opens login; "sign in" always opens sign-in.
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setInfoMsg(null);
      // Never carry a typed password across a close/reopen.
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const switchMode = (next: 'login' | 'signin') => {
    setMode(next);
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // On sign-up the user must re-type the password to confirm it matches.
    if (mode === 'signin' && password !== confirmPassword) {
      setErrorMsg('รหัสผ่านไม่ตรงกัน (Passwords do not match).');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { user } = await authApi.login(email, password);
        onSuccess(safeUserToProfile(user, { companyName, taxId }));
        onClose();
      } else {
        const { firstName, lastName } = splitName(fullName);
        // Registration signs the user straight in (email verification disabled).
        const { user } = await authApi.register({
          firstName,
          lastName,
          email,
          password,
          company: { mode: 'create', legalName: companyName, taxId: taxId || null },
          termsAccepted: true
        });
        onSuccess(safeUserToProfile(user, { companyName, taxId }));
        onClose();
      }
    } catch (error) {
      setErrorMsg(friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email) {
      setErrorMsg('กรุณากรอกอีเมลก่อนขอรีเซ็ตรหัสผ่าน (Enter your email first).');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setInfoMsg('หากมีบัญชีสำหรับอีเมลนี้ ลิงก์รีเซ็ตรหัสผ่านจะถูกส่งไป (FR9).');
    } catch {
      // Forgot-password is intentionally non-revealing; show the same message on error.
      setInfoMsg('หากมีบัญชีสำหรับอีเมลนี้ ลิงก์รีเซ็ตรหัสผ่านจะถูกส่งไป (FR9).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden p-6 md:p-8">

        {/* Close Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title matching Desktop - LogIn / Desktop - SignIn */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
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
                  ชื่อ-นามสกุลผู้ติดต่อ (Full Name)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="สมชาย ใจดี"
                    className="w-full pl-10 pr-4 py-2.5 theme-input rounded-xl text-sm placeholder-slate-400"
                  />
                </div>
              </div>

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
                  className="text-[11px] text-slate-500 hover:underline"
                >
                  ลืมรหัสผ่าน? (Reset Password)
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={mode === 'signin' ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signin' ? 'อย่างน้อย 8 ตัวอักษร' : ''}
                className="w-full pl-10 pr-10 py-2.5 theme-input rounded-xl text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ยืนยันรหัสผ่าน (Confirm Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  className="w-full pl-10 pr-10 py-2.5 theme-input rounded-xl text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showConfirm ? 'Hide password' : 'Show password'}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-500" />
              <span>{infoMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm transition-all text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
                onClick={() => switchMode('signin')}
                className="text-slate-600 dark:text-slate-300 font-semibold hover:underline"
              >
                Sign In (ลงทะเบียน)
              </button>
            </p>
          ) : (
            <p>
              มีบัญชี Software House อยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
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

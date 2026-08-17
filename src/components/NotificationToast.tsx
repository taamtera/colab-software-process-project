'use client';

import React from 'react';
import { X, BellRing, ArrowRight } from 'lucide-react';
import { TORContract } from '@/types';

interface NotificationToastProps {
  contract: TORContract | null;
  onClose: () => void;
  onViewContract: (contract: TORContract) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  contract,
  onClose,
  onViewContract
}) => {
  if (!contract) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800 rounded-lg p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        
        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <BellRing className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300">พบสัญญา TOR ตรงคุณสมบัติ!</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-sky-600 text-white">
              {contract.matchedScore}% Match
            </span>
          </div>
          
          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
            {contract.title}
          </h4>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
            วงเงิน: <strong className="text-sky-700 dark:text-sky-300">{contract.priceFormatted}</strong> • เขต{contract.district}
          </p>

          <button
            onClick={() => {
              onViewContract(contract);
              onClose();
            }}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>ดูรายละเอียดสัญญา TOR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

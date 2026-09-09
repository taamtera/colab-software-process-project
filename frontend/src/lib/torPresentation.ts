const ANNOUNCEMENT_STAGE_LABELS: Record<string, string> = {
  P0: 'Procurement Plan',
  '15': 'Reference Price',
  B0: 'Draft TOR',
  D0: 'Tender Open',
  D1: 'Tender Cancelled',
  D2: 'Tender Changed',
  W0: 'Awarded',
  W1: 'Award Cancelled',
  W2: 'Award Changed'
};

export const ANNOUNCEMENT_STAGE_CODES = ['P0', '15', 'B0', 'D0', 'D1', 'D2', 'W0', 'W1', 'W2'];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  cancelled: 'Cancelled',
  awarded: 'Awarded',
  'Open for Bidding': 'Open',
  'Under AI Review': 'Under AI Review',
  Matched: 'Matched',
  Closed: 'Closed'
};

export function getCode(value: string | Record<string, unknown> | null | undefined) {
  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }
  const nestedValue = value?.code || value?.id || value?.value || value?.announcementType || value?.type;
  return String(nestedValue || '').trim().toUpperCase();
}

export function getAnnouncementStage(value: string | Record<string, unknown> | null | undefined) {
  const code = getCode(value);
  return ANNOUNCEMENT_STAGE_LABELS[code] || code || 'TOR Announcement';
}

export function getStageCode(announcementType: string | Record<string, unknown> | null | undefined, status?: string | null) {
  const code = getCode(announcementType);
  if (ANNOUNCEMENT_STAGE_CODES.includes(code)) {
    return code;
  }
  return status || 'open';
}

export function getStatusKey(status: string | null | undefined, announcementType?: string | Record<string, unknown> | null) {
  const normalized = status || '';
  if (normalized === 'Open for Bidding') return 'open';
  if (normalized === 'Closed') return 'closed';
  if (normalized === 'Under AI Review' || normalized === 'Matched') return normalized;
  if (STATUS_LABELS[normalized]) return normalized;
  const code = getCode(announcementType);
  if (['D1', 'W1'].includes(code)) return 'cancelled';
  if (['W0', 'W2'].includes(code)) return 'awarded';
  return 'open';
}

export function getStatusLabel(status: string | null | undefined, announcementType?: string | Record<string, unknown> | null) {
  const stageCode = getCode(announcementType);
  if (ANNOUNCEMENT_STAGE_LABELS[stageCode]) {
    return ANNOUNCEMENT_STAGE_LABELS[stageCode];
  }
  const key = getStatusKey(status, announcementType);
  return STATUS_LABELS[key] || key;
}

export function getStatusClasses(status: string | null | undefined, announcementType?: string | Record<string, unknown> | null) {
  const stageCode = getCode(announcementType);
  if (stageCode === 'P0' || stageCode === '15' || stageCode === 'B0') {
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  }
  if (stageCode === 'D0' || stageCode === 'D2') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (stageCode === 'D1' || stageCode === 'W1') {
    return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
  }
  if (stageCode === 'W0' || stageCode === 'W2') {
    return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800';
  }

  switch (getStatusKey(status, announcementType)) {
    case 'open':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    case 'awarded':
      return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    case 'closed':
      return 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    case 'draft':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    case 'Under AI Review':
      return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800';
    case 'Matched':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

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
  const key = getStatusKey(status, announcementType);
  return STATUS_LABELS[key] || key;
}

const STAGE_STATUS = {
  P0: 'open',
  '15': 'open',
  B0: 'open',
  D0: 'open',
  D1: 'cancelled',
  D2: 'open',
  W0: 'awarded',
  W1: 'cancelled',
  W2: 'awarded'
};

function announcementCode(value) {
  if (typeof value === 'string') {
    return value;
  }
  return value?.code || value?.id || value?.value || null;
}

function statusFor(tor) {
  return tor.status || STAGE_STATUS[announcementCode(tor.announcementType)] || 'open';
}

export function serializeTor(tor) {
  const templateId = tor.templateId ?? null;
  return {
    ...tor,
    templateId,
    projectId: tor.projectId ?? null,
    title: tor.title ?? null,
    description: tor.description ?? null,
    departmentId: tor.departmentId ?? null,
    departmentName: tor.departmentName ?? null,
    publishedAt: tor.publishedAt ?? null,
    procurementMethod: tor.procurementMethod ?? null,
    announcementType: tor.announcementType ?? null,
    url: tor.url ?? tor.sourceUrl ?? null,
    documentUrl: tor.documentUrl ?? null,
    thumbnail: tor.thumbnail ?? (templateId ? `/api/thumbnail/${encodeURIComponent(templateId)}` : null),
    status: statusFor(tor)
  };
}

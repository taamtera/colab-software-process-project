import { TORContract, TORRequirement } from '@/types';
import { resolveApiUrl } from './api';

interface BackendTor {
  _id?: string;
  id?: string;
  templateId?: string | null;
  projectId?: string | null;
  sourceId?: string | null;
  title?: string | null;
  description?: string | null;
  departmentName?: string | null;
  publishedAt?: string | null;
  submissionDeadline?: string | null;
  projectStartAt?: string | null;
  projectEndAt?: string | null;
  url?: string | null;
  documentUrl?: string | null;
  thumbnail?: string | null;
  procurementMethod?: string | Record<string, unknown> | null;
  announcementType?: string | Record<string, unknown> | null;
  category?: string | null;
  status?: string | null;
  budget?: {
    minAmount?: number | null;
    maxAmount?: number | null;
  } | null;
  tagAssignments?: Array<{
    tagId?: string;
    requirementLevel?: 'required' | 'preferred' | 'informational';
    evidence?: string | null;
  }>;
}

interface BackendTorListResponse {
  items: BackendTor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function textValue(value: string | Record<string, unknown> | null | undefined) {
  if (typeof value === 'string') return value;
  return String(value?.name || value?.label || value?.code || value?.id || '');
}

function formatBudget(budget: BackendTor['budget']) {
  const amount = budget?.maxAmount ?? budget?.minAmount;
  if (typeof amount !== 'number') return 'Not specified';
  return `${amount.toLocaleString('en-US')} THB`;
}

function mapRequirements(tor: BackendTor): TORRequirement[] {
  return (tor.tagAssignments || []).map((assignment, index) => ({
    id: assignment.tagId || `tag-${index}`,
    property: assignment.evidence || assignment.requirementLevel || 'Tagged requirement',
    category: 'technical',
    required: assignment.requirementLevel === 'required'
  }));
}

export function toTorContract(tor: BackendTor): TORContract {
  const title = tor.title?.trim() || 'Untitled TOR announcement';
  const publicationDate = tor.publishedAt || '';
  const documentUrl = tor.documentUrl || tor.url || null;

  return {
    id: tor._id || tor.id || tor.templateId || `${tor.sourceId || 'tor'}-${title}`,
    templateId: tor.templateId || null,
    projectId: tor.projectId || null,
    title,
    contractOwner: tor.departmentName || tor.sourceId || 'e-GP',
    departmentId: null,
    departmentName: tor.departmentName || null,
    publisherType: 'Ministry',
    price: tor.budget?.maxAmount || tor.budget?.minAmount || 0,
    priceFormatted: formatBudget(tor.budget),
    startDate: tor.projectStartAt || '',
    endDate: tor.projectEndAt || '',
    postingDate: publicationDate,
    publishedAt: tor.publishedAt || null,
    submissionDeadline: tor.submissionDeadline || 'Not specified',
    category: textValue(tor.procurementMethod) || 'Government procurement',
    procurementMethod: tor.procurementMethod || null,
    announcementType: tor.announcementType || null,
    description: tor.description || '',
    properties: mapRequirements(tor),
    pdfUrl: documentUrl || '',
    url: tor.url || null,
    documentUrl: tor.documentUrl || null,
    aiEvaluation: {
      priceScore: 0,
      priceAssessment: 'AI evaluation not available yet.',
      qualificationMatchScore: 0,
      riskLevel: 'Medium',
      riskAnalysis: 'No AI evaluation is available for this announcement.',
      keyRequirementsExtracted: [],
      aiModel: 'Not evaluated',
      evaluatedAt: ''
    },
    status: tor.status || 'open',
    thumbnail: tor.thumbnail || undefined
  };
}

export async function listTors(): Promise<{ items: TORContract[]; total: number }> {
  const endpoint = resolveApiUrl('/api/tors?status=&page=1&limit=100');
  if (!endpoint) {
    throw new Error('The TOR API URL is not configured.');
  }

  let response: Response;
  try {
    response = await fetch(endpoint, { credentials: 'include', cache: 'no-store' });
  } catch {
    throw new Error('Could not reach the TOR backend.');
  }

  if (!response.ok) {
    throw new Error(`The TOR backend returned HTTP ${response.status}.`);
  }

  const body = await response.json() as BackendTorListResponse;
  return {
    items: (body.items || []).map(toTorContract),
    total: body.pagination?.total ?? body.items?.length ?? 0
  };
}

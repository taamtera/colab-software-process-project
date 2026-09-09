export interface TORRequirement {
  id: string;
  property: string;
  category: 'technical' | 'experience' | 'certification' | 'financial';
  required: boolean;
  fulfilledBySoftwareHouse?: boolean;
}

export interface AIEvaluation {
  priceScore: number; // 0-100 score on budget fairness
  priceAssessment: string;
  qualificationMatchScore: number; // 0-100 match percentage
  riskLevel: 'Low' | 'Medium' | 'High';
  riskAnalysis: string;
  keyRequirementsExtracted: string[];
  aiModel: string;
  evaluatedAt: string;
}

export interface TORContract {
  id: string;
  templateId?: string | null;
  projectId?: string | null;
  title: string;
  contractOwner: string; // Publisher / Organization
  departmentId?: string | null;
  departmentName?: string | null;
  publisherType: 'BMA (กรุงเทพมหานคร)' | 'Ministry' | 'State Enterprise' | 'Public Organization' | string;
  price: number; // THB
  priceFormatted: string;
  startDate: string;
  endDate: string;
  postingDate: string;
  publishedAt?: string | null;
  submissionDeadline: string;
  category: 'e-Bidding (ประกวดราคาอิเล็กทรอนิกส์)' | 'Consulting (จ้างที่ปรึกษา)' | 'IT & Software (เทคโนโลยีและซอฟต์แวร์)' | 'General Services (จ้างเหมาบริการ)' | 'Specific Selection (วิธีเฉพาะเจาะจง)' | string;
  procurementMethod?: string | Record<string, unknown> | null;
  announcementType?: string | Record<string, unknown> | null;
  description: string;
  properties: TORRequirement[];
  pdfUrl: string;
  url?: string | null;
  documentUrl?: string | null;
  aiEvaluation: AIEvaluation;
  status: 'Open for Bidding' | 'Under AI Review' | 'Matched' | 'Closed' | string;
  matchedScore?: number;
  thumbnail?: string;
}

export interface SoftwareHouseProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  taxId: string;
  avatar: string;
  companySize: string;
  district: string;
  properties: string[]; // List of company qualifications / capabilities
  technologies: string[];
  certifications: string[];
  minPreferredBudget: number;
  maxPreferredBudget: number;
  notificationsEnabled: boolean;
  matchedTORIds: string[];
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minMatchScore: number;
  status: string;
}

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
  title: string;
  contractOwner: string; // Publisher / Organization
  publisherType: 'BMA (กรุงเทพมหานคร)' | 'Ministry' | 'State Enterprise' | 'Public Organization';
  district: string; // Bangkok District
  price: number; // THB
  priceFormatted: string;
  startDate: string;
  endDate: string;
  postingDate: string;
  submissionDeadline: string;
  category: 'Smart City' | 'Web & Mobile' | 'Cloud & DevOps' | 'AI & Analytics' | 'Cybersecurity';
  description: string;
  properties: TORRequirement[];
  pdfUrl: string;
  pdfPagesCount: number;
  aiEvaluation: AIEvaluation;
  status: 'Open for Bidding' | 'Under AI Review' | 'Matched' | 'Closed';
  matchedScore?: number;
  thumbnail: string;
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
  district: string;
  minPrice: number;
  maxPrice: number;
  minMatchScore: number;
  status: string;
}

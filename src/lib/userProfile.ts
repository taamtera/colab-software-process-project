import { SoftwareHouseProfile } from '@/types';
import type { SafeUser } from '@/lib/authApi';

// Maps the backend's SafeUser (identity only) onto the app's richer
// SoftwareHouseProfile. Capability/company fields are not yet owned by the auth
// backend, so we keep sensible defaults and overlay the real identity on top.
// Replace with a real company/profile endpoint when one exists.
const PROFILE_DEFAULTS = {
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

export function safeUserToProfile(
  user: SafeUser,
  overrides: { companyName?: string; taxId?: string } = {}
): SoftwareHouseProfile {
  const name = [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ') || user.email;
  return {
    id: user.id,
    name,
    email: user.email,
    companyName: overrides.companyName || name,
    taxId: overrides.taxId || '',
    avatar: user.profile.avatarUrl || PROFILE_DEFAULTS.avatar,
    companySize: PROFILE_DEFAULTS.companySize,
    district: PROFILE_DEFAULTS.district,
    properties: PROFILE_DEFAULTS.properties,
    technologies: PROFILE_DEFAULTS.technologies,
    certifications: PROFILE_DEFAULTS.certifications,
    minPreferredBudget: PROFILE_DEFAULTS.minPreferredBudget,
    maxPreferredBudget: PROFILE_DEFAULTS.maxPreferredBudget,
    notificationsEnabled: PROFILE_DEFAULTS.notificationsEnabled,
    matchedTORIds: PROFILE_DEFAULTS.matchedTORIds
  };
}

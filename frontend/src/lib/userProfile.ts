import { SoftwareHouseProfile } from '@/types';
import type { SafeUser } from '@/lib/authApi';

// Maps the backend's SafeUser (identity only) onto the app's richer
// SoftwareHouseProfile. The auth backend does not yet own company/qualification
// data, so a signed-in account starts with an EMPTY portfolio — the user fills in
// their properties, tech stack, and certifications via the profile form. Only the
// neutral UI fallbacks below are pre-set. Replace with a real company/profile
// endpoint when one exists.
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';

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
    avatar: user.profile.avatarUrl || DEFAULT_AVATAR,
    companySize: '',
    district: '',
    // Empty portfolio for a new/just-signed-in account — no fabricated data.
    properties: [],
    technologies: [],
    certifications: [],
    minPreferredBudget: 0,
    maxPreferredBudget: 0,
    notificationsEnabled: true,
    matchedTORIds: []
  };
}

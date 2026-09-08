// The ONLY way user data leaves the API. Strips passwordHash, token hashes,
// failed-login counters, and lock details so they never reach the frontend
// (docs/authentication-contract.md "Safe User Response"). Enforces NFR6.
export function toSafeUser(user) {
  if (!user) {
    return null;
  }

  const profile = user.profile ?? {};

  return {
    id: user._id.toString(),
    email: user.email,
    profile: {
      firstName: profile.firstName ?? null,
      lastName: profile.lastName ?? null,
      phone: profile.phone ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      jobTitle: profile.jobTitle ?? null
    },
    companyId: user.companyId ? user.companyId.toString() : null,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt ?? null
  };
}

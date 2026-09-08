import { authConfig } from '../config/env.mjs';

// Email delivery stub. Until a real provider is wired in, delivery is logged so
// verification / reset links are usable in development. The raw token appears ONLY
// here and in the emailed link — never in the database or an API response.
//
// To make this real, replace `deliver` with an SMTP / transactional-email call.
// Keep the function signatures so callers do not change.

function deliver(kind, email, link) {
  console.info(`[email:${kind}] to=${email} link=${link}`);
}

export async function sendPasswordResetEmail({ email, token }) {
  deliver('reset-password', email, `${authConfig.appBaseUrl}/reset-password?token=${token}`);
}

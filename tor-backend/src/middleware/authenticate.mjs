import { ACCESS_COOKIE, parseCookies } from '../utils/cookies.mjs';
import { httpError } from '../utils/http-error.mjs';
import { verifyAccessToken } from '../utils/tokens.mjs';

// Reads and verifies the access-token cookie and attaches request.user.
// Every protected route must run this — the frontend hiding an action is never
// sufficient (docs/authentication-contract.md).
export function authenticate(request, response, next) {
  const cookies = parseCookies(request);
  const claims = verifyAccessToken(cookies[ACCESS_COOKIE]);

  if (!claims || !claims.sub) {
    next(httpError(401, 'TOKEN_INVALID', 'Authentication is required.'));
    return;
  }

  request.user = {
    id: claims.sub,
    companyId: claims.companyId ?? null,
    role: claims.role ?? null,
    sessionId: claims.sid ?? null
  };

  next();
}

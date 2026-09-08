import { authConfig } from '../config/env.mjs';

// Cookie names and helpers for the auth session. Writing uses Express's built-in
// res.cookie/res.clearCookie (no cookie-parser needed); reading parses the raw
// Cookie header ourselves to avoid adding a dependency.

export const ACCESS_COOKIE = 'tor_access';
export const REFRESH_COOKIE = 'tor_refresh';

export function parseCookies(request) {
  const header = request.headers?.cookie;
  const jar = {};

  if (!header) {
    return jar;
  }

  for (const pair of header.split(';')) {
    const index = pair.indexOf('=');

    if (index === -1) {
      continue;
    }

    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();

    if (name) {
      try {
        jar[name] = decodeURIComponent(value);
      } catch {
        jar[name] = value;
      }
    }
  }

  return jar;
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: authConfig.cookieSecure,
    sameSite: 'lax',
    path: '/'
  };
}

export function setAuthCookies(response, { accessToken, refreshToken }) {
  response.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions(),
    maxAge: authConfig.accessTtlSeconds * 1000
  });
  response.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions(),
    maxAge: authConfig.refreshTtlDays * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(response) {
  const options = baseCookieOptions();
  response.clearCookie(ACCESS_COOKIE, options);
  response.clearCookie(REFRESH_COOKIE, options);
}

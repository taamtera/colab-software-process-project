const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

export function resolveApiUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

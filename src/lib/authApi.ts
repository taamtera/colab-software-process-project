// Typed client for the TOR authentication API (tor-backend /api/auth/*).
// All requests send credentials so the httpOnly access/refresh cookies flow.
// No token is ever read or stored in JS — the browser holds them as httpOnly cookies.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface SafeUser {
  id: string;
  email: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    jobTitle: string | null;
  };
  companyId: string | null;
  role: string;
  status: 'pending_verification' | 'active' | 'suspended' | 'disabled';
  emailVerifiedAt: string | null;
}

export interface ApiErrorShape {
  code: string;
  message: string;
  requestId?: string;
}

export class ApiError extends Error {
  code: string;
  requestId?: string;

  constructor({ code, message, requestId }: ApiErrorShape) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.requestId = requestId;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
      ...options
    });
  } catch {
    throw new ApiError({ code: 'NETWORK_ERROR', message: 'Could not reach the server. Please try again.' });
  }

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const error = (body as { error?: ApiErrorShape } | null)?.error;
    throw new ApiError(
      error ?? { code: 'UNEXPECTED_ERROR', message: 'Something went wrong. Please try again.' }
    );
  }

  return body as T;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jobTitle?: string | null;
  phone?: string | null;
  company: {
    mode: 'create';
    legalName: string;
    displayName?: string | null;
    taxId?: string | null;
    companySize?: string | null;
    district?: string | null;
  };
  termsAccepted: boolean;
}

export function register(input: RegisterInput): Promise<{ user: SafeUser }> {
  return request('/register', { body: JSON.stringify(input) });
}

export function login(email: string, password: string): Promise<{ user: SafeUser }> {
  return request('/login', { body: JSON.stringify({ email, password }) });
}

export function logout(): Promise<{ message: string }> {
  return request('/logout', { body: '{}' });
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return request('/forgot-password', { body: JSON.stringify({ email }) });
}

export function me(): Promise<{ user: SafeUser }> {
  return request('/me', { method: 'GET' });
}

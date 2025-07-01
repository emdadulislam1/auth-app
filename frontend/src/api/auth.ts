// ... existing code ...

export interface LoginResponse {
  token?: string;
  requiresTOTP?: boolean;
  totpEnabled?: boolean;
  error?: string;
}

const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  return baseUrl;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return data;
}

export async function verifyTOTP(email: string, password: string, totpCode: string): Promise<LoginResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/login-2fa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, totpCode })
  });
  const data = await res.json();
  return data;
}

export interface UserInfo {
  email: string;
  totpEnabled: boolean;
}

export async function getUserInfo(token: string): Promise<UserInfo> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return data;
}

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
}

export async function setupMFA(token: string): Promise<MFASetupResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/2fa/setup`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function verifyMFA(token: string, totpCode: string): Promise<{ success: boolean }> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/2fa/verify`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: totpCode })
  });
  return res.json();
}

export async function disableMFA(token: string): Promise<{ success: boolean }> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/2fa/disable`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

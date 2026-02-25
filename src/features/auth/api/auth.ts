import { User } from '../../../entities/user/lib/types';
import { apiFetch } from '../../../shared/api';

type AuthResponse = {
  accessToken: string,
  expAccess: number,
  refreshToken: string,
  expRefresh: number,
  metadata: User,
}

export async function fetchAuth(
  login: string,
  password: string
) {
  let body;
  if (login.includes("@")) {
    body = JSON.stringify({ email: login, password });
  }
  else {
    body = JSON.stringify({ login: login, password });
  }

  return apiFetch<AuthResponse>('auth', {
    method: 'POST',
    body: body,
  })
}

export async function fetchReg(
  login: string,
  email: string,
  password: string
) {
  return apiFetch<AuthResponse>('auth/reg', {
    method: 'POST',
    body: JSON.stringify({ email, login: login, pw1: password, pw2: password }),
  })
}

export async function validateTokens() {
  return apiFetch('auth/token', {
    method: 'GET'
  })
}

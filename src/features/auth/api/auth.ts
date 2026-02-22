import { apiFetch } from '../../../shared/api';

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

  return apiFetch('auth', {
    method: 'POST',
    body: body,
  })
}

export async function fetchReg(
  login: string,
  email: string,
  password: string
) {
  return apiFetch('auth/reg', {
    method: 'POST',
    body: JSON.stringify({ email, login: login, pw1: password, pw2: password }),
  })
}

export async function validateTokens() {
  return apiFetch('auth/token', {
    method: 'GET'
  })
}

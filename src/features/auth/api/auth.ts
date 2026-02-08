import { BASE_URL } from '../../../shared/consts/index'

export async function fetchAuth(
  login: string,
  password: string
) {
  let body;
  if (login.includes("@")) {
    body = JSON.stringify({ email: login, password })
  }
  else {
    body = JSON.stringify({ login: login, password })
  }

  return fetch(`${BASE_URL}auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body
  }).then((response) => {
    switch (response.status) {
      case 200:
      case 204:
        return;
      case 400:
        throw "неправильный запрос"
      case 404:
        throw "неправильный логин или пароль"
      case 502:
      case 504:
        throw "Ошибка сервера"
    }
  })
    .catch(e => {
      throw new Error(e);
    })
}

export async function fetchReg(
  login: string,
  email: string,
  password: string
) {
  return fetch(`${BASE_URL}auth/reg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, login: login, pw1: password, pw2: password })
  }).then((response) => {
    switch (response.status) {
      case 200:
      case 204:
        return;
      case 302:
        throw "пользователь существует"
      case 400:
        throw "неправильный запрос"
      case 502:
      case 504:
        throw "Ошибка сервера"
    }
  })
    .catch(e => {
      throw new Error(e);
    })
}

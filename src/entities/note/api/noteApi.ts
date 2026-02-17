import { useAuthStore } from "../../../features/auth/lib/authStore";
import { BASE_URL } from "../../../shared/consts"

export const createNote = async (title: string) => {
  const {setGuest} = useAuthStore();

  return fetch(`${BASE_URL}note`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  }).then(response => {
    switch (response.status) {
      case 201:
      case 204:
        return response.json();
      case 400:
        throw "неправильный запрос"
      case 401:
        setGuest();
        return;
      case 502:
      case 504:
        throw "Ошибка сервера"
    }
  })
    .catch(e => {
      throw new Error(e);
    })
}

export const getNote = async(id: string) => {
  const {setGuest} = useAuthStore();

  return fetch(`${BASE_URL}note?id=${id}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  }).then(response => {
    switch (response.status) {
      case 200:
        return response.json();
      case 400:
        throw "неправильный запрос"
      case 401:
        setGuest();
        return;
      case 502:
      case 504:
        throw "Ошибка сервера"
    }
  })
    .catch(e => {
      throw new Error(e);
    })
}
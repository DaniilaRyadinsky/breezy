import { userStore } from "@/entities/user";
import { API_URL } from "../consts";
import { HttpError } from "./HttpError";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    },
  })
    .then(async response => {
      if (!response.ok) {
        throw new HttpError(response.status, 'Response not OK');
      }

      if (response.status === 204) {
        return null as T;
      }

      return response.json() as Promise<T>;
    })
    .catch(e => {
      if (e.status === 401) {
        userStore.getState().setGuest();
      }

      throw e;
    });
}
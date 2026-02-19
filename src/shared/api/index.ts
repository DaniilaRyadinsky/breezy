import { HttpError } from './HttpError';
import { BASE_URL } from '../consts/BaseUrl';
import { useAuthStore } from '../../entities/user/lib/authStore';


export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) : Promise<T> {
  return fetch(`${BASE_URL}${endpoint}`, 
    {...options, 
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json' }})
    .then(response => {
      if (!response.ok) {
        throw new HttpError(response.status, 'Response not OK');
      }
      if (response.status === 204) {
        return null as T;
      }
      return response.json() as Promise<T>;
    })
    .catch(e => {
      if (e.status == 401) {
        useAuthStore.getState().setGuest();
      }
      return Promise.reject(e)
    })

}

import { BASE_URL } from '../../../shared/consts/index'

interface AuthParams {
  username: string;
  password: string;
  onSuccess: () => void;
  onError: () => void;
}



async function fetchLogin({ username, password, onSuccess, onError }: AuthParams) {
  fetch(`${BASE_URL}authentication`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then((response) => response.json()).then((result) => {
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      onSuccess();
    }
    else {
      console.log(result.error)
      onError();
    }
  })
}

type IResponse = {
  access_token?: string,
  error?: string
}

async function fetchReg({ username, password, onSuccess, onError }: AuthParams) {
  fetch(`${BASE_URL}register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(async (response) => {
    const result = await response.json();
    if (response.ok) {
      localStorage.setItem('access_token', result.access_token);
      onSuccess
    } else {
      console.log(result.error)
      onError
    }
  })
}



export { fetchLogin,  fetchReg}
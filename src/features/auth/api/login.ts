import { NavigateFunction, useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../../shared/consts/index'
// import { setInputModeLog, setInputModePass } from '../ui/LoginForm'

interface LoginParams {
  username: string;
  password: string;
  onSuccess: () => void;
  onError: () => void;
}


async function fetchLogin({ username, password, onSuccess, onError }: LoginParams) {
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


export { fetchLogin }
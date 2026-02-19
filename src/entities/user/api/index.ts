import { apiFetch } from "../../../shared/api"

export const getUser = async () => {
  return apiFetch('user/data', {
    method: "GET"
  })
}


export const deleteUser = async () => {
  return apiFetch('user', {
    method: "DETELE"
  })
}


export const updateUserAbout = async (new_about: string) => {
  return apiFetch('user/about', {
    method: "PATCH",
    body: JSON.stringify({ new_about })
  })
}


export const updateUserEmail = async (new_email: string) => {
  return apiFetch('user/email', {
    method: "PATCH",
    body: JSON.stringify({ new_email })
  })
}

export const updateUserPhoto = async (new_photo: string) => {
  return apiFetch('user/photo', {
    method: "PATCH",
    body: JSON.stringify({ new_photo })
  })
}

export const updateUserPassword = async (new_password: string, old_password: string) => {
  return apiFetch('user/pw', {
    method: "PATCH",
    body: JSON.stringify({ new_password, new_password_2: new_password, old_password })
  })
}
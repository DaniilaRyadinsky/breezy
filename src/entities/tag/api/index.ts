import { apiFetch } from "../../../shared/api"

export const postTag = async (title: string, color: string, emoji: string) => {
  return apiFetch('tag', {
    method: "POST",
    body: JSON.stringify({ title, color, emoji })
  })
}

export const getUserTags = async () => {
  return apiFetch('tag/by-user', {
    method: "GET"
  })
}

export const deleteTag = async (id: string) => {
  return apiFetch('tag', {
    method: "DELETE"
  })
}

export const updateTagColor = async (id_tag: string, color: string) => {
  return apiFetch('tag/color', {
    method: "PATCH",
    body: JSON.stringify({ id_tag, color })
  })
}

export const updateTagEmoji = async (id_tag: string, emoji: string) => {
  return apiFetch('tag/emoji', {
    method: "PATCH",
    body: JSON.stringify({ id_tag, emoji })
  })
}


export const updateTagTitle = async (id_tag: string, title: string) => {
  return apiFetch('tag/title', {
    method: "PATCH",
    body: JSON.stringify({ id_tag, title })
  })
}



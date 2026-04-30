import { apiFetch } from ".";

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{name: string}>("files", {
    method: "POST",
    body: formData,
  });
};

export const deleteFile = (name: string) => {
    return apiFetch(`files?title=${name}`, {
        method: 'DELETE',
    });
}
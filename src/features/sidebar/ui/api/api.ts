import { BASE_URL } from "../../../../shared/consts";
import { useAuthStore } from "../../../auth/lib/authStore";

export const fetchNoteList = async (

) => {
  const { setGuest } = useAuthStore()
  const response = await fetch(`${BASE_URL}note/all`);

  if (response.status == 401)
    setGuest();
  if (!response.ok) throw new Error();
  
  return await response.json();
}
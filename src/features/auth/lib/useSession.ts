import { userStore } from "@/entities/user"
import { useEffect } from "react"
import { validateTokens } from "../api/auth"

export function useSession() {
  const setAuth = userStore((s) => s.setAuth)
  const removeUser = userStore((s) => s.removeUser)
  const status = userStore((s) => s.status)

  useEffect(() => {

    if (status !== 'unknown') return

    validateTokens()
      .then(() => setAuth())
      .catch(() => removeUser())
  }, [status])
}
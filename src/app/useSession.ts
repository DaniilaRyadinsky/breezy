import { userStore } from "../entities/user/lib/userStore"
import { validateTokens } from "../features/auth/api/auth"
import { useEffect } from "react"

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
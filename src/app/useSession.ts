import { useAuthStore } from "../entities/user/lib/authStore"
import { validateTokens } from "../features/auth/api/auth"
import { useEffect } from "react"

export function useSession() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setGuest = useAuthStore((s) => s.setGuest)
  const status = useAuthStore((s) => s.status)

  useEffect(() => {

    if (status !== 'unknown') return

    validateTokens()
      .then(() => setAuth())
      .catch(() => setGuest())
  }, [status])
}
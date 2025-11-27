import type { User } from "@/shared/types"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function setToken(token: string): void {
  localStorage.setItem("token", token)
}

export function removeToken(): void {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

export function setUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user))
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

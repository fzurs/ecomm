import Cookies from "js-cookie"

/**
 * The header Django checks on every write with a session: the `csrftoken`
 * cookie, which only this origin's JavaScript can read. Every request to the
 * API that isn't through the generated client (e.g. a `fetch` stream) sends it
 * too. Empty if there's no cookie yet (before the session is first read).
 */
export function csrfHeader(): Record<string, string> {
  const token = Cookies.get("csrftoken")
  return token ? { "X-CSRFToken": token } : {}
}

import {
  getAllauthBrowserV1AuthEmailVerify,
  getAllauthBrowserV1AuthPasswordReset,
} from "@workspace/api-client/allauth"
import { API_URL } from "@/lib/django"

// The links in allauth's emails (HEADLESS_FRONTEND_URLS in the API): checked
// on the server before showing their form, so a used or expired link says so
// right away. Without the visitor's cookies: the key is all they need.

/** The key of a link's path: allauth sends it URL-encoded. */
export function decodeKey(key: string) {
  try {
    return decodeURIComponent(key)
  } catch {
    return key
  }
}

/** The email an email confirmation link confirms, or null if it's invalid or expired. */
export async function getEmailToConfirm(key: string) {
  const result = await getAllauthBrowserV1AuthEmailVerify({
    baseURL: API_URL,
    headers: { "X-Email-Verification-Key": key },
  })
  if (!result.error) return result.data.data.email
  if (result.response?.status === 400) return null
  throw new Error(`Couldn't check the link: ${result.response?.status}`)
}

/** Whether a password reset link still works. */
export async function isPasswordResetKeyValid(key: string) {
  const result = await getAllauthBrowserV1AuthPasswordReset({
    baseURL: API_URL,
    headers: { "X-Password-Reset-Key": key },
  })
  if (!result.error) return true
  if (result.response?.status === 400) return false
  throw new Error(`Couldn't check the link: ${result.response?.status}`)
}

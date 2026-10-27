import { client } from "@workspace/api-client/client"

// A plain link, not a query: the browser opens the PDF with the session cookie.
export function invoicePdfUrl(id: number) {
  return `${client.getConfig().baseURL}/invoices/${id}/pdf/`
}

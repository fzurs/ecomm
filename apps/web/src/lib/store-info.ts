// The store's own data, from the server's environment (apps/web/.env.example):
// the footer and the help pages show it. Missing ones are left out.

/** ARCA's "Data fiscal" link: the QR every online store has to show. */
export const DATA_FISCAL_URL = process.env.DATA_FISCAL_URL ?? ""
// ARCA's own image for it, as its instructions ask to show it.
export const DATA_FISCAL_IMAGE =
  "https://www.afip.gob.ar/images/f960/DATAWEB.jpg"

export const CONTACT = {
  email: process.env.STORE_CONTACT_EMAIL ?? "",
  phone: process.env.STORE_CONTACT_PHONE ?? "",
  address: process.env.STORE_CONTACT_ADDRESS ?? "",
  hours: process.env.STORE_CONTACT_HOURS ?? "",
}

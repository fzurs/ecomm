import type {
  Province,
  ShippingMethod,
  ShippingOptions,
} from "@workspace/api-client"

// Keyed by the generated enum (shipping.models.Province): a new one fails the
// typecheck until it has its name here.
export const provinces: Record<Province, string> = {
  caba: "Ciudad Autónoma de Buenos Aires",
  buenos_aires: "Buenos Aires",
  catamarca: "Catamarca",
  chaco: "Chaco",
  chubut: "Chubut",
  cordoba: "Córdoba",
  corrientes: "Corrientes",
  entre_rios: "Entre Ríos",
  formosa: "Formosa",
  jujuy: "Jujuy",
  la_pampa: "La Pampa",
  la_rioja: "La Rioja",
  mendoza: "Mendoza",
  misiones: "Misiones",
  neuquen: "Neuquén",
  rio_negro: "Río Negro",
  salta: "Salta",
  san_juan: "San Juan",
  san_luis: "San Luis",
  santa_cruz: "Santa Cruz",
  santa_fe: "Santa Fe",
  santiago_del_estero: "Santiago del Estero",
  tierra_del_fuego: "Tierra del Fuego",
  tucuman: "Tucumán",
}

/** The provinces the store ships to, by name. */
export function servedProvinces(options: ShippingOptions) {
  return options.zones
    .flatMap((zone) => zone.provinces)
    .map((value) => ({ value, label: provinces[value] }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"))
}

/**
 * What shipping costs, or null if it can't go that way. The same rule as the
 * API's `shipping.services.quote`, which is the one that charges it: free to
 * pick up, and the province's zone cost, free from its `free_from`.
 */
export function shippingCost(
  options: ShippingOptions,
  method: ShippingMethod,
  province: Province | "",
  subtotal: number
): number | null {
  if (method === "pickup") return options.pickup_address ? 0 : null
  const zone = options.zones.find(
    (zone) => province && zone.provinces.includes(province)
  )
  if (!zone) return null
  if (zone.free_from != null && subtotal >= zone.free_from) return 0
  return zone.cost
}

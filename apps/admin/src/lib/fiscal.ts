import {
  DocumentTypeEnum,
  ReceptorDocumentType,
  VatCondition,
  VatRate,
} from "@workspace/api-client"
import {
  zDocumentTypeEnum,
  zVatCondition,
  zVatRate,
} from "@workspace/api-client/zod"

// ARCA codes and their names. Keyed by the generated enums: a code added in the
// API fails the typecheck until it gets its label here. The IVA conditions keep
// ARCA's names, the ones on the invoices.

export const documentTypes: Record<DocumentTypeEnum, string> = {
  80: "CUIT",
  86: "CUIL",
  87: "CDI",
  96: "DNI",
  89: "LE",
  90: "LC",
  94: "Passport",
  91: "Foreign ID",
  0: "Federal Police ID",
  30: "Migration certificate",
}

export const receptorDocumentTypes: Record<ReceptorDocumentType, string> = {
  80: "CUIT",
  86: "CUIL",
  96: "DNI",
  99: "Unidentified",
}

export const vatConditions: Record<VatCondition, string> = {
  1: "IVA Responsable Inscripto",
  4: "IVA Sujeto Exento",
  5: "Consumidor Final",
  6: "Responsable Monotributo",
  7: "Sujeto No Categorizado",
  8: "Proveedor del Exterior",
  9: "Cliente del Exterior",
  10: "IVA Liberado - Ley N° 19.640",
  13: "Monotributista Social",
  15: "IVA No Alcanzado",
  16: "Monotributo Trabajador Independiente Promovido",
}

// They get Factura A, which needs their CUIT: arca-client's `CONDICIONES_A`,
// which the API checks when saving a customer.
export const cuitRequiredVatConditions: VatCondition[] = [1, 6, 13, 16]

export const vatRates: Record<VatRate, string> = {
  1: "Non-taxed",
  2: "Exempt",
  3: "0%",
  4: "10.5%",
  5: "21%",
  6: "27%",
  8: "5%",
  9: "2.5%",
}

// For selects, in the API's order.
function options<T extends number>(
  values: readonly { value: T }[],
  labels: Record<T, string>
) {
  return values.map(({ value }) => ({ value, label: labels[value] }))
}

export const documentTypeOptions = options(
  zDocumentTypeEnum.options,
  documentTypes
)
export const vatConditionOptions = options(zVatCondition.options, vatConditions)
export const vatRateOptions = options(zVatRate.options, vatRates)

/** "CUIT 20123456786", or the type alone when there is no number. */
export function formatDocument(type: string, number?: string | null) {
  return number ? `${type} ${number}` : type
}

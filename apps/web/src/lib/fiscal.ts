import type { DocumentTypeEnum, VatCondition } from "@workspace/api-client"

// What the checkout offers of ARCA's codes (orders.models.Customer): the ones a
// store's customer uses. The admin has them all (apps/admin/src/lib/fiscal.ts).

export const documentTypes: { value: DocumentTypeEnum; label: string }[] = [
  { value: 96, label: "DNI" },
  { value: 80, label: "CUIT" },
  { value: 86, label: "CUIL" },
  { value: 94, label: "Passport" },
]

export const FINAL_CONSUMER: VatCondition = 5

export const vatConditions: { value: VatCondition; label: string }[] = [
  { value: FINAL_CONSUMER, label: "Final consumer" },
  { value: 1, label: "Responsable Inscripto" },
  { value: 6, label: "Monotributo" },
  { value: 4, label: "VAT exempt" },
]

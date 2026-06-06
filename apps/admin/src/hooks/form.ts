import { createFormHook } from "@tanstack/react-form"
import { fieldContext, formContext } from "./form-context"
import { FormField, FormInput, FormLabel, FormMessage } from "@/components/form"

export const { useAppForm } = createFormHook({
  fieldComponents: {
    Field: FormField,
    Input: FormInput,
    Label: FormLabel,
    Message: FormMessage,
  },
  formComponents: {},
  fieldContext,
  formContext,
})

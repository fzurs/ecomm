import { createFormHook } from "@tanstack/react-form"
import { fieldContext, formContext } from "./form-context"
import { SubscribeButton } from "@/components/subscribe-button"

export const { useAppForm, useTypedAppFormContext, withForm } = createFormHook({
  fieldComponents: {},
  formComponents: { SubscribeButton },
  fieldContext,
  formContext,
})

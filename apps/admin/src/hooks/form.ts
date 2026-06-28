import { createFormHook } from "@tanstack/react-form"
import { fieldContext, formContext } from "./form-context"
import {
  FormRoot,
  FormField,
  FormLabel,
  FormInput,
  FormNumberInput,
  FormInputGroupInput,
  FormTextarea,
  FormSelect,
  FormSelectTrigger,
  FormCheckbox,
  FormMessage,
  FormSubmit,
} from "@/components/form"

export const { useAppForm, useTypedAppFormContext, withForm } = createFormHook({
  fieldComponents: {
    Field: FormField,
    Label: FormLabel,
    Input: FormInput,
    NumberInput: FormNumberInput,
    InputGroupInput: FormInputGroupInput,
    Textarea: FormTextarea,
    Select: FormSelect,
    SelectTrigger: FormSelectTrigger,
    Checkbox: FormCheckbox,
    Message: FormMessage,
  },
  formComponents: { Form: FormRoot, Submit: FormSubmit },
  fieldContext,
  formContext,
})

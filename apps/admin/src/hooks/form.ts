import { createFormHook } from "@tanstack/react-form"
import { fieldContext, formContext } from "./form-context"
import {
  FormRoot,
  FormField,
  FormLabel,
  FormInput,
  FormImageInput,
  FormNumberInput,
  FormInputGroupInput,
  FormTextarea,
  FormSelect,
  FormSelectTrigger,
  FormCheckbox,
  FormMessage,
  FormSubmit,
  FormComboboxQueryOnOpenById,
} from "@/components/form"

export const { useAppForm, useTypedAppFormContext, withForm } = createFormHook({
  fieldComponents: {
    Field: FormField,
    Label: FormLabel,
    Input: FormInput,
    NumberInput: FormNumberInput,
    ImageInput: FormImageInput,
    InputGroupInput: FormInputGroupInput,
    Textarea: FormTextarea,
    Select: FormSelect,
    SelectTrigger: FormSelectTrigger,
    Checkbox: FormCheckbox,
    Message: FormMessage,
    ComboboxQueryOnOpenById: FormComboboxQueryOnOpenById,
  },
  formComponents: { Form: FormRoot, Submit: FormSubmit },
  fieldContext,
  formContext,
})

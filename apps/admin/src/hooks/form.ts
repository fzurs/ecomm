import { createFormHook } from "@tanstack/react-form"
import { fieldContext, formContext } from "./form-context"
import {
  Form,
  TextField,
  NumberField,
  EmailField,
  TextareaField,
  InputGroupField,
  CheckboxField,
  FileField,
  SelectField,
  PasswordField,
  SubmitButton,
} from "@/components/form"

export const { useAppForm, useTypedAppFormContext, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    EmailField,
    TextareaField,
    InputGroupField,
    CheckboxField,
    FileField,
    SelectField,
    NumberField,
    PasswordField,
  },
  formComponents: { Form, SubmitButton },
  fieldContext,
  formContext,
})

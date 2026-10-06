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
  SubmitButton,
} from "@/components/form"
import { PasswordField } from "@/components/password-field"

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

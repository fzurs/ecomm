import { isAxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setFormErrors<TFieldValues extends FieldValues>(
  errors: Record<string, string[]>,
  form: UseFormReturn<TFieldValues>,
  rootField = "non_field_errors",
) {
  Object.entries(errors).forEach(([field, messages]) => {
    if (field in form.getValues()) {
      form.setError(field as Path<TFieldValues>, { message: messages[0] });
    }
  });

  const rootMessages = errors[rootField];
  if (rootMessages) {
    form.setError("root", {
      message: rootMessages[0],
      type: "server",
    });
  }
}

export function handleBadRequestError<TFieldValues extends FieldValues>(
  error: Error,
  form: UseFormReturn<TFieldValues>,
) {
  if (isAxiosError(error) && error.response?.status === 400) {
    setFormErrors(error.response.data, form);
  }
}

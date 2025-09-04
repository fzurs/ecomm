import { isAxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setFormErrors<TFieldValues extends FieldValues>(
  errors: Record<string, string[]>,
  setError: UseFormSetError<TFieldValues>,
  nonFieldErrors = "non_field_errors",
) {
  const validFields = Object.keys(setError) as (keyof TFieldValues)[];

  Object.entries(errors).forEach(([field, messages]) => {
    if (validFields.includes(field as keyof TFieldValues)) {
      setError(field as Path<TFieldValues>, { message: messages[0] });
    } else {
      console.warn(`Field "${field}" not found in form, skipping.`);
    }
  });

  const rootMessage = errors[nonFieldErrors];
  if (rootMessage) {
    setError("root" as Path<TFieldValues>, { message: rootMessage[0] });
  }
}

export function handleBadRequestError<TFieldValues extends FieldValues>(
  error: Error,
  setError: UseFormSetError<TFieldValues>,
) {
  if (isAxiosError(error) && error.response?.status === 400) {
    setFormErrors(error.response.data, setError);
  }
}

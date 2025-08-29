import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setFormErrors<TFieldValues extends FieldValues>(
  errors: Record<string, string[]>,
  setError: UseFormSetError<TFieldValues>,
  rootField = "non_field_errors"
) {
  Object.entries(errors).forEach(([field, messages]) => {
    setError(field as Path<TFieldValues>, { message: messages[0] });
  });
  setError("root", { message: errors[rootField][0] });
}

export function handleBadRequestError<TFieldValues extends FieldValues>(
  error: Error,
  setError: UseFormSetError<TFieldValues>
) {
  if (isAxiosError(error) && error.response?.status === 400) {
    setFormErrors(error.response.data, setError);
  }
}

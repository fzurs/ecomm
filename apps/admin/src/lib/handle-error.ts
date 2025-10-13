import { isAxiosError } from "axios";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export function handleError<TFieldValues extends FieldValues>(
  error: Error,
  form: UseFormReturn<TFieldValues>,
) {
  const isBadRequest = isAxiosError(error) && error.response?.status === 400;

  if (isBadRequest) {
    const errors = error.response?.data as Record<string, string[]>;
    Object.entries(errors).forEach(([field, messages]) => {
      if (field in form.getValues()) {
        form.setError(field as Path<TFieldValues>, {
          message: messages[0],
        });
      }
    });
    return errors["non_field_errors"][0];
  }

  return;
}

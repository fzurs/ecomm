"use client"
import { useFormContext } from "@/hooks/form-context"
import { Button } from "@workspace/ui/components/button"

export function SubscribeButton({
  ...props
}: React.ComponentProps<typeof Button>) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.isSubmitting, state.isPristine]}
      children={([isSubmitting, isPristine]) => (
        <Button
          form={form.formId}
          type="submit"
          disabled={isSubmitting || isPristine}
          {...props}
        />
      )}
    />
  )
}

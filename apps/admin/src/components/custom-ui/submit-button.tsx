"use client";

import { Loader2 } from "lucide-react";

import * as React from "react";

import { Button } from "@/components/ui/button";

function SubmitButton({
  isLoading = false,
  disabled = isLoading,
  children = isLoading ? "Submitting..." : "Submit",
  loadingState,
  ...props
}: React.ComponentProps<typeof Button> & {
  isLoading?: boolean;
  loadingState?: React.ReactNode;
}) {
  return (
    <Button type="submit" disabled={disabled} {...props}>
      {isLoading && <Loader2 className="animate-spin" />}
      {isLoading && loadingState ? loadingState : children}
    </Button>
  );
}

export { SubmitButton };

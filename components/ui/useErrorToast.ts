"use client";

import { useCallback } from "react";
import { useToast } from "./Toast";

export function useErrorToast() {
  const { toast } = useToast();
  return useCallback(
    (err: unknown, fallback?: string) => {
      const description =
        fallback ??
        (err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Something went wrong. Please try again.");
      Promise.resolve().then(() =>
        Promise.resolve().then(() =>
          toast({
            title: "Error",
            description,
            variant: "error",
            durationMs: 4000,
          })
        )
      );
    },
    [toast]
  );
}

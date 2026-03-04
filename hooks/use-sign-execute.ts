"use client";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
interface UseSignExecuteOptions {
  /** Query keys to invalidate after successful transaction */
  invalidateKeys?: string[][];
  onSuccess?: (digest: string) => void;
  onError?: (error: Error) => void;
}

export function useSignExecute(options: UseSignExecuteOptions = {}) {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDigest, setLastDigest] = useState<string | null>(null);

  const execute = useCallback(
    async (tx: unknown) => {
      setIsPending(true);
      setError(null);
      setLastDigest(null);

      try {
        // v1 Transaction from @suistody/core is runtime-compatible with v2
        const result = await signAndExecute({
          transaction: tx as Parameters<typeof signAndExecute>[0]["transaction"],
        });
        const digest = result.digest;
        setLastDigest(digest);

        if (options.invalidateKeys) {
          for (const key of options.invalidateKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        }

        options.onSuccess?.(digest);
        return digest;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        options.onError?.(err instanceof Error ? err : new Error(message));
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [signAndExecute, queryClient, options]
  );

  return { execute, isPending, error, lastDigest };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuiUsdPrice } from "@suistody/core";
import { ensureInit } from "@/lib/suistody";

export function SuiPrice() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sui-price"],
    queryFn: async () => {
      ensureInit();
      return await getSuiUsdPrice();
    },
    refetchInterval: 30_000,
  });

  if (isLoading) return <span className="text-gray-400">Loading...</span>;
  if (error) return <span className="text-red-400">Price unavailable</span>;

  return (
    <span className="font-mono text-sm">
      SUI ${data?.price.toFixed(4)}
    </span>
  );
}

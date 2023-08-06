"use client";

import { QueryClient, QueryClientProvider } from "react-query";

export default function IntersectionObserverProvider({ children }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
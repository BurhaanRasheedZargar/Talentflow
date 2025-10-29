import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
						gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
						retry: 1,
						refetchOnWindowFocus: false,
						refetchOnReconnect: false,
						refetchOnMount: false, // Don't refetch on mount if data is fresh
					},
					mutations: { 
						retry: 0,
						// Don't invalidate queries during mutation - we use optimistic updates
						gcTime: 0,
					},
				},
			})
	);

	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}



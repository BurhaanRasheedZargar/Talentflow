import { useQuery } from "@tanstack/react-query";
import { fetchLocationOptions, type LocationOption } from "../../../api/locations";

export function useLocationOptions() {
	return useQuery<LocationOption[]>({
		queryKey: ["location-options"],
		queryFn: fetchLocationOptions,
		staleTime: 24 * 60 * 60 * 1000,
	});
}



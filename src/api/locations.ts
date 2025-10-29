export interface LocationOption {
	value: string;
	label: string;
}

export async function fetchLocationOptions(): Promise<LocationOption[]> {
	// Use Rest Countries (CORS-enabled). We'll combine capitals and country names.
	const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital');
	if (!res.ok) throw new Error('Failed to load locations');
	const data = await res.json();
	const options: LocationOption[] = [];
	for (const c of data) {
		const country = c?.name?.common as string | undefined;
		const capitals = (c?.capital ?? []) as string[];
		if (Array.isArray(capitals) && capitals.length) {
			capitals.forEach((cap) => {
				if (cap) options.push({ value: cap, label: `${cap}` });
			});
		} else if (country) {
			options.push({ value: country, label: country });
		}
	}
	// Deduplicate and sort
	const dedup = new Map<string, LocationOption>();
	for (const o of options) {
		dedup.set(o.value, o);
	}
	return Array.from(dedup.values()).sort((a, b) => a.label.localeCompare(b.label));
}



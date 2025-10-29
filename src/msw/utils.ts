export function randomDelay(minMs = 20, maxMs = 150): Promise<void> {
	// Ultra-low latency for buttery smooth performance
	const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function shouldFailWrite(probability = 0.08): boolean {
	return Math.random() < probability;
}

export function parseNumberParam(value: string | null, fallback: number): number {
	const n = value ? Number(value) : NaN;
	return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseStringParam(value: string | null): string | null {
	if (value == null) return null;
	const trimmed = value.trim();
	return trimmed.length ? trimmed : null;
}



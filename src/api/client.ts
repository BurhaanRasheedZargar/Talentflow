export interface PaginatedResponse<T> {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

export async function getJson<T>(url: string): Promise<T> {
    async function doFetch(): Promise<{ res: Response; text: string }> {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            },
        });
        const text = await res.text().catch(() => "");
        return { res, text };
    }

    // First attempt
    let { res, text } = await doFetch();
    let contentType = res.headers.get("content-type") || "";
    let isHtml = text.trim().startsWith("<!") || text.toLowerCase().includes("<!doctype");

    // If HTML detected (likely MSW not intercepting right now), retry once after short delay
    if (isHtml || (!contentType.includes("application/json") && text.length > 0)) {
        await new Promise(r => setTimeout(r, 150));
        ({ res, text } = await doFetch());
        contentType = res.headers.get("content-type") || "";
        isHtml = text.trim().startsWith("<!") || text.toLowerCase().includes("<!doctype");
    }

    // Still HTML or wrong content-type → throw helpful error
    if (isHtml || (!contentType.includes("application/json") && text.length > 0)) {
        if (isHtml) {
            throw new Error(`API request returned HTML instead of JSON. This usually means the MSW service worker isn't intercepting requests or the route isn't registered. URL: ${url}. Please check the browser console for MSW status.`);
        }
        throw new Error(`Expected JSON but got ${contentType || "unknown"}. Response: ${text.substring(0, 200)}`);
    }

    // Non-OK
    if (!res.ok) {
        try {
            const json = JSON.parse(text);
            throw new Error(json.message || json.error || `Request failed: ${res.status}`);
        } catch {
            throw new Error(text || `Request failed: ${res.status}`);
        }
    }

    // Parse JSON
    try {
        return JSON.parse(text) as T;
    } catch (error) {
        throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}. Response: ${text.substring(0, 200)}`);
    }
}



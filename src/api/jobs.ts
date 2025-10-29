import type { Job } from "../db/types";
import { getJson, type PaginatedResponse } from "./client";

export function fetchJobs(params: { page?: number; pageSize?: number; search?: string; status?: string; tag?: string } = {}) {
	const query = new URLSearchParams();
	if (params.page) query.set("page", String(params.page));
	if (params.pageSize) query.set("pageSize", String(params.pageSize));
	if (params.search) query.set("search", params.search);
	if (params.status) query.set("status", params.status);
    if (params.tag) query.set("tag", params.tag);
	const qs = query.toString();
	return getJson<PaginatedResponse<Job>>(`/jobs${qs ? `?${qs}` : ""}`);
}

export async function createJob(input: Partial<Job>): Promise<Job> {
    const res = await fetch(`/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
}

export async function updateJob(id: number, input: Partial<Job>): Promise<Job> {
    const res = await fetch(`/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
}

export async function reorderJobApi(id: number, order: number): Promise<Job> {
    const res = await fetch(`/jobs/${id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
}

export async function archiveJobApi(id: number): Promise<Job> {
    const res = await fetch(`/jobs/${id}/archive`, { method: 'PATCH' });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
}

export async function unarchiveJobApi(id: number): Promise<Job> {
    const res = await fetch(`/jobs/${id}/unarchive`, { method: 'PATCH' });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
}

export async function deleteJobApi(id: number): Promise<{ ok: true }> {
    const res = await fetch(`/jobs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
}

export async function fetchArchivedJobs(params: { page?: number; pageSize?: number; search?: string; tag?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.search) query.set("search", params.search);
    if (params.tag) query.set("tag", params.tag);
    const qs = query.toString();
    return getJson<PaginatedResponse<Job>>(`/jobs/archived${qs ? `?${qs}` : ""}`);
}



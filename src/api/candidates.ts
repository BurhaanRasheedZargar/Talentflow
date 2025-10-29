import type { PaginatedResponse } from "./client";
import { getJson } from "./client";

export interface CandidateDto {
	id: number;
	name: string;
	email: string;
	jobId: number | null;
	stage: string;
	createdAt: number;
}

export function fetchCandidates(params: { page?: number; pageSize?: number; search?: string; stage?: string; jobId?: number } = {}) {
	const query = new URLSearchParams();
	if (params.page) query.set("page", String(params.page));
	if (params.pageSize) query.set("pageSize", String(params.pageSize));
	if (params.search) query.set("search", params.search);
	if (params.stage) query.set("stage", params.stage);
	if (params.jobId != null) query.set("jobId", String(params.jobId));
	const qs = query.toString();
	return getJson<PaginatedResponse<CandidateDto>>(`/candidates${qs ? `?${qs}` : ""}`);
}

export async function fetchCandidateTimeline(id: number): Promise<{ items: Array<{ id: number; message: string; createdAt: number; type: string }> }> {
    const res = await fetch(`/candidates/${id}/timeline`);
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function addCandidateNote(id: number, message: string) {
    const res = await fetch(`/candidates/${id}/timeline`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function fetchCandidateById(id: number): Promise<CandidateDto> {
    const res = await fetch(`/candidates/${id}`);
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function createCandidate(input: Partial<CandidateDto>): Promise<CandidateDto> {
    const res = await fetch('/candidates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function updateCandidate(id: number, input: Partial<CandidateDto>): Promise<CandidateDto> {
    const res = await fetch(`/candidates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function deleteCandidateApi(id: number): Promise<{ ok: true }> {
    const res = await fetch(`/candidates/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}



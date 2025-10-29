import type { PaginatedResponse } from "./client";

export interface AssessmentDto {
	id: number;
	candidateId: number;
	jobId: number;
	score: number;
	status: 'pending' | 'completed';
	createdAt: number;
}

export function fetchAssessments(params: { page?: number; pageSize?: number; status?: string; jobId?: number; candidateId?: number } = {}) {
	const query = new URLSearchParams();
	if (params.page) query.set("page", String(params.page));
	if (params.pageSize) query.set("pageSize", String(params.pageSize));
	if (params.status) query.set("status", params.status);
	if (params.jobId != null) query.set("jobId", String(params.jobId));
	if (params.candidateId != null) query.set("candidateId", String(params.candidateId));
	const qs = query.toString();
	return fetch(`/assessments${qs ? `?${qs}` : ""}`).then(async r => {
		if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
		return r.json() as Promise<PaginatedResponse<AssessmentDto>>;
	});
}

export async function createAssessment(input: Partial<AssessmentDto>): Promise<AssessmentDto> {
    const res = await fetch('/assessments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function updateAssessment(id: number, input: Partial<AssessmentDto>): Promise<AssessmentDto> {
    const res = await fetch(`/assessments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function deleteAssessmentApi(id: number): Promise<{ ok: true }> {
    const res = await fetch(`/assessments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

// Builder APIs
export async function getAssessmentBuilder(jobId: number): Promise<any> {
    const res = await fetch(`/assessments/${jobId}`);
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function putAssessmentBuilder(jobId: number, builder: any): Promise<any> {
    const res = await fetch(`/assessments/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(builder) });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}

export async function submitAssessment(jobId: number, candidateId: number, answers: Record<string, any>): Promise<any> {
    const res = await fetch(`/assessments/${jobId}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId, answers }) });
    if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
    return res.json();
}



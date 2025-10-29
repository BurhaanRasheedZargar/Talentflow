import { http, HttpResponse } from "msw";
import { db } from "../../db";
import { parseNumberParam, parseStringParam, randomDelay } from "../utils";

// GET /assessments?jobId=&candidateId=&status=&page=&pageSize=
export const getAssessments = http.get("/assessments", async ({ request }) => {
	await randomDelay();
	const url = new URL(request.url);
	const page = parseNumberParam(url.searchParams.get("page"), 1);
	const pageSize = parseNumberParam(url.searchParams.get("pageSize"), 20);
	const status = parseStringParam(url.searchParams.get("status"));
	const candidateIdStr = parseStringParam(url.searchParams.get("candidateId"));
	const jobIdStr = parseStringParam(url.searchParams.get("jobId"));
	const candidateId = candidateIdStr ? Number(candidateIdStr) : null;
	const jobId = jobIdStr ? Number(jobIdStr) : null;

	let items = await db.assessments.orderBy("createdAt").reverse().toArray();
	if (candidateId != null && Number.isFinite(candidateId)) items = items.filter(a => a.candidateId === candidateId);
	if (jobId != null && Number.isFinite(jobId)) items = items.filter(a => a.jobId === jobId);
	if (status) items = items.filter(a => a.status === status);
	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.max(1, Math.min(page, totalPages));
	const start = (currentPage - 1) * pageSize;
	const paged = items.slice(start, start + pageSize);
	return HttpResponse.json({ items: paged, page: currentPage, pageSize, total, totalPages });
});

// GET /assessments/:jobId - builder
export const getAssessmentBuilder = http.get('/assessments/:jobId', async ({ params }) => {
    await randomDelay();
    const jobId = Number(params.jobId);
    const builder = await db.assessmentBuilders.get(jobId);
    return HttpResponse.json(builder ?? { jobId, sections: [] });
});

// PUT /assessments/:jobId - save builder
export const putAssessmentBuilder = http.put('/assessments/:jobId', async ({ params, request }) => {
    await randomDelay();
    const jobId = Number(params.jobId);
    const body = (await request.json()) as any;
    await db.assessmentBuilders.put({ jobId, sections: body.sections ?? [] } as any);
    const saved = await db.assessmentBuilders.get(jobId);
    return HttpResponse.json(saved);
});

// POST /assessments/:jobId/submit - store response
export const postAssessmentSubmit = http.post('/assessments/:jobId/submit', async ({ params, request }) => {
    await randomDelay();
    const jobId = Number(params.jobId);
    const body = (await request.json()) as any;
    const resp = { jobId, candidateId: body.candidateId, answers: body.answers ?? {}, createdAt: Date.now() };
    const id = await db.assessmentResponses.add(resp as any);
    return HttpResponse.json({ ...resp, id }, { status: 201 });
});

// POST /assessments
export const postAssessment = http.post('/assessments', async ({ request }) => {
    await randomDelay();
    const body = (await request.json()) as any;
    const a = {
        candidateId: body.candidateId,
        jobId: body.jobId,
        score: body.score ?? 0,
        status: body.status ?? 'pending',
        createdAt: Date.now(),
    };
    const id = await db.assessments.add(a as any);
    return HttpResponse.json({ ...a, id }, { status: 201 });
});

// PATCH /assessments/:id
export const patchAssessment = http.patch('/assessments/:id', async ({ params, request }) => {
    await randomDelay();
    const id = Number(params.id);
    const body = (await request.json()) as any;
    await db.assessments.update(id, body);
    const updated = await db.assessments.get(id);
    return HttpResponse.json(updated);
});

// DELETE /assessments/:id
export const deleteAssessment = http.delete('/assessments/:id', async ({ params }) => {
    await randomDelay();
    const id = Number(params.id);
    await db.assessments.delete(id);
    return HttpResponse.json({ ok: true });
});



import { http, HttpResponse } from "msw";
import { db } from "../../db";
import { parseNumberParam, parseStringParam, randomDelay } from "../utils";

// GET /candidates?jobId=&stage=&search=&page=&pageSize=
export const getCandidates = http.get("/candidates", async ({ request }) => {
	await randomDelay();
	const url = new URL(request.url);
	const page = parseNumberParam(url.searchParams.get("page"), 1);
	const pageSize = parseNumberParam(url.searchParams.get("pageSize"), 20);
	const search = parseStringParam(url.searchParams.get("search"));
	const stage = parseStringParam(url.searchParams.get("stage"));
	const jobIdStr = parseStringParam(url.searchParams.get("jobId"));
	const jobId = jobIdStr ? Number(jobIdStr) : null;

	let items = await db.candidates.orderBy("createdAt").reverse().toArray();
	if (jobId != null && Number.isFinite(jobId)) items = items.filter(c => c.jobId === jobId);
	if (stage) items = items.filter(c => c.stage === stage);
	if (search) {
		const q = search.toLowerCase();
		items = items.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
	}
	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.max(1, Math.min(page, totalPages));
	const start = (currentPage - 1) * pageSize;
	const paged = items.slice(start, start + pageSize);
	return HttpResponse.json({ items: paged, page: currentPage, pageSize, total, totalPages });
});

// GET /candidates/:id/timeline
export const getCandidateTimeline = http.get('/candidates/:id/timeline', async ({ params }) => {
    await randomDelay();
    const id = Number(params.id);
    const items = await db.candidateTimelines.where('candidateId').equals(id).orderBy('createdAt').toArray();
    return HttpResponse.json({ items });
});

// POST /candidates/:id/timeline (add note)
export const postCandidateTimeline = http.post('/candidates/:id/timeline', async ({ params, request }) => {
    await randomDelay();
    const id = Number(params.id);
    const body = (await request.json()) as any;
    const entry = { candidateId: id, type: 'note', message: String(body.message || ''), createdAt: Date.now() } as any;
    const eid = await db.candidateTimelines.add(entry);
    return HttpResponse.json({ ...entry, id: eid }, { status: 201 });
});

// GET /candidates/:id
export const getCandidateById = http.get('/candidates/:id', async ({ params }) => {
    await randomDelay();
    const id = Number(params.id);
    const c = await db.candidates.get(id);
    if (!c) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(c);
});

// POST /candidates
export const postCandidate = http.post("/candidates", async ({ request }) => {
    await randomDelay();
    const body = (await request.json()) as any;
    const candidate = {
        name: body.name ?? '',
        email: (body.email ?? '').toLowerCase(),
        jobId: body.jobId ?? null,
        stage: body.stage ?? 'applied',
        createdAt: Date.now(),
    };
    const id = await db.candidates.add(candidate as any);
    return HttpResponse.json({ ...candidate, id }, { status: 201 });
});

// PATCH /candidates/:id
export const patchCandidate = http.patch("/candidates/:id", async ({ params, request }) => {
    await randomDelay();
    const id = Number(params.id);
    const body = (await request.json()) as any;
    if (body.email) body.email = (body.email as string).toLowerCase();
    await db.candidates.update(id, body);
    const updated = await db.candidates.get(id);
    return HttpResponse.json(updated);
});

// DELETE /candidates/:id
export const deleteCandidate = http.delete("/candidates/:id", async ({ params }) => {
    await randomDelay();
    const id = Number(params.id);
    await db.candidates.delete(id);
    return HttpResponse.json({ ok: true });
});



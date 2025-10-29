import { http, HttpResponse } from "msw";
import { db } from "../../db";
import { randomDelay, parseNumberParam, parseStringParam } from "../utils";

export const getJobs = http.get("/jobs", async ({ request }) => {
	await randomDelay();

	const url = new URL(request.url);
	const page = parseNumberParam(url.searchParams.get("page"), 1);
	const pageSize = parseNumberParam(url.searchParams.get("pageSize"), 10);
	const search = parseStringParam(url.searchParams.get("search"));
    const status = parseStringParam(url.searchParams.get("status"));
    const tag = parseStringParam(url.searchParams.get("tag"));
    const archivedParam = url.searchParams.get("archived");
    const archived = archivedParam == null ? false : archivedParam === 'true';

    let items;
    if (status) {
        // Filter by status, then sort by createdAt desc in JS (Dexie v4 collections do not support orderBy after where)
        items = await db.jobs.where("status").equals(status).toArray();
        items.sort((a, b) => b.createdAt - a.createdAt);
    } else {
        items = await db.jobs.orderBy("createdAt").reverse().toArray();
    }

    if (search) {
		const q = search.toLowerCase();
		items = items.filter(j => j.titleLowercase.includes(q));
	}

    if (tag) {
        const tagLower = tag.toLowerCase();
        items = items.filter(j => (j.tags ?? []).some(t => t.toLowerCase().includes(tagLower)));
    }

    // archived filter (default false => only active)
    items = items.filter(j => Boolean(j.archived) === archived);

	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.max(1, Math.min(page, totalPages));
	const start = (currentPage - 1) * pageSize;
	const paged = items.slice(start, start + pageSize);

	return HttpResponse.json({
		items: paged,
		page: currentPage,
		pageSize,
		total,
		totalPages,
	});
});

// POST /jobs -> create
export const postJob = http.post("/jobs", async ({ request }) => {
    await randomDelay();
    const body = (await request.json()) as any;
    const now = Date.now();
    const title: string = body.title;
    const slug = (title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const existing = await db.jobs.where('slug').equals(slug).count();
    if (existing > 0) {
        return HttpResponse.json({ message: 'Slug already exists' }, { status: 409 });
    }
    const maxOrder = (await db.jobs.orderBy("order").last())?.order ?? -1;
    const job = {
        title,
        department: body.department ?? "",
        location: body.location ?? "Remote",
        status: body.status ?? "open",
        createdAt: now,
        titleLowercase: title.toLowerCase(),
        slug,
        archived: false,
        order: maxOrder + 1,
        tags: body.tags ?? [],
        description: body.description ?? '',
    };
    const id = await db.jobs.add(job as any);
    return HttpResponse.json({ ...job, id }, { status: 201 });
});

// PATCH /jobs/:id -> update fields
export const patchJob = http.patch("/jobs/:id", async ({ params, request }) => {
    await randomDelay();
    const id = Number(params.id);
    const body = (await request.json()) as any;
    if (body.title) {
        body.titleLowercase = (body.title as string).toLowerCase();
        const newSlug = (body.title as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const existing = await db.jobs.where('slug').equals(newSlug).toArray();
        if (existing.some(j => j.id !== id)) {
            return HttpResponse.json({ message: 'Slug already exists' }, { status: 409 });
        }
        body.slug = newSlug;
    }
    await db.jobs.update(id, body);
    const updated = await db.jobs.get(id);
    return HttpResponse.json(updated);
});

// PATCH /jobs/:id/reorder -> set order (optimistic DnD)
export const reorderJob = http.patch("/jobs/:id/reorder", async ({ params, request }) => {
    await randomDelay();
    const id = Number(params.id);
    const { order } = (await request.json()) as { order: number };
    await db.jobs.update(id, { order });
    const updated = await db.jobs.get(id);
    return HttpResponse.json(updated);
});

// Archive / Unarchive
export const archiveJob = http.patch("/jobs/:id/archive", async ({ params }) => {
    await randomDelay();
    const id = Number(params.id);
    await db.jobs.update(id, { archived: true });
    const updated = await db.jobs.get(id);
    return HttpResponse.json(updated);
});

export const unarchiveJob = http.patch("/jobs/:id/unarchive", async ({ params }) => {
    await randomDelay();
    const id = Number(params.id);
    await db.jobs.update(id, { archived: false });
    const updated = await db.jobs.get(id);
    return HttpResponse.json(updated);
});

// DELETE /jobs/:id
export const deleteJob = http.delete("/jobs/:id", async ({ params }) => {
    await randomDelay();
    const id = Number(params.id);
    await db.jobs.delete(id);
    return HttpResponse.json({ ok: true });
});

// GET /jobs/archived - convenience endpoint for archived jobs listing
export const getArchivedJobs = http.get("/jobs/archived", async ({ request }) => {
    await randomDelay();
    const url = new URL(request.url);
    const page = parseNumberParam(url.searchParams.get("page"), 1);
    const pageSize = parseNumberParam(url.searchParams.get("pageSize"), 10);
    const search = parseStringParam(url.searchParams.get("search"));
    const tag = parseStringParam(url.searchParams.get("tag"));
    let items = await db.jobs.orderBy('createdAt').reverse().toArray();
    // Only archived
    items = items.filter(j => Boolean(j.archived) === true);
    if (search) {
        const q = search.toLowerCase();
        items = items.filter(j => j.titleLowercase.includes(q));
    }
    if (tag) items = items.filter(j => (j.tags ?? []).includes(tag));
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const start = (currentPage - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return HttpResponse.json({ items: paged, page: currentPage, pageSize, total, totalPages });
});



import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job } from "../../../db/types";
import { archiveJobApi, createJob, deleteJobApi, fetchArchivedJobs, fetchJobs, reorderJobApi, unarchiveJobApi, updateJob } from "../../../api/jobs";

export function useJobsList(params: { page?: number; pageSize?: number; search?: string; status?: string } = { page: 1, pageSize: 20 }) {
	return useQuery({
		queryKey: ["jobs", params],
		queryFn: () => fetchJobs(params),
		keepPreviousData: true,
	});
}

export function useArchivedJobsList(params: { page?: number; pageSize?: number; search?: string; tag?: string } = { page: 1, pageSize: 20 }) {
	return useQuery({ queryKey: ["jobs-archived", params], queryFn: () => fetchArchivedJobs(params), keepPreviousData: true });
}

export function useCreateJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: Partial<Job>) => createJob(input),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["jobs"] });
		},
	});
}

export function useUpdateJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: number; input: Partial<Job> }) => updateJob(id, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
	});
}

export function useReorderJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, order }: { id: number; order: number }) => reorderJobApi(id, order),
		onMutate: async ({ id, order }) => {
			await qc.cancelQueries({ queryKey: ["jobs"] });
			const prev = qc.getQueriesData<any>({ queryKey: ["jobs"] });
			prev.forEach(([key, data]) => {
				if (!data) return;
				const idx = (data.items as Job[]).findIndex((j) => j.id === id);
				if (idx >= 0) {
					(data.items[idx] as Job).order = order;
					(data.items as Job[]).sort((a, b) => a.order - b.order);
					qc.setQueryData(key as any, { ...data, items: [...data.items] });
				}
			});
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			if (!ctx) return;
			(ctx.prev as any[]).forEach(([key, data]) => qc.setQueryData(key as any, data));
		},
		onSettled: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
	});
}

export function useArchiveJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => archiveJobApi(id),
		onMutate: async (id: number) => {
			await qc.cancelQueries({ queryKey: ["jobs"] });
			await qc.cancelQueries({ queryKey: ["jobs-archived"] });
			const prevActive = qc.getQueriesData<any>({ queryKey: ["jobs"] });
			const prevArchived = qc.getQueriesData<any>({ queryKey: ["jobs-archived"] });
			// Remove from active lists
			prevActive.forEach(([key, data]) => {
				if (!data) return;
				const idx = (data.items as Job[]).findIndex(j => j.id === id);
				if (idx >= 0) {
					const item = { ...(data.items[idx] as Job), archived: true };
					const nextItems = [...data.items];
					nextItems.splice(idx, 1);
					qc.setQueryData(key as any, { ...data, items: nextItems });
					// Add to archived first page cache if present
					prevArchived.forEach(([akey, adata]) => {
						if (!adata) return;
						qc.setQueryData(akey as any, { ...adata, items: [item, ...adata.items] });
					});
				}
			});
			return { prevActive, prevArchived };
		},
		onError: (_err, _id, ctx) => {
			if (!ctx) return;
			(ctx.prevActive as any[]).forEach(([key, data]) => qc.setQueryData(key as any, data));
			(ctx.prevArchived as any[]).forEach(([key, data]) => qc.setQueryData(key as any, data));
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["jobs"] });
			qc.invalidateQueries({ queryKey: ["jobs-archived"] });
		},
	});
}

export function useUnarchiveJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => unarchiveJobApi(id),
		onMutate: async (id: number) => {
			await qc.cancelQueries({ queryKey: ["jobs"] });
			await qc.cancelQueries({ queryKey: ["jobs-archived"] });
			const prevActive = qc.getQueriesData<any>({ queryKey: ["jobs"] });
			const prevArchived = qc.getQueriesData<any>({ queryKey: ["jobs-archived"] });
			// Remove from archived lists
			prevArchived.forEach(([key, data]) => {
				if (!data) return;
				const idx = (data.items as Job[]).findIndex(j => j.id === id);
				if (idx >= 0) {
					const item = { ...(data.items[idx] as Job), archived: false };
					const nextItems = [...data.items];
					nextItems.splice(idx, 1);
					qc.setQueryData(key as any, { ...data, items: nextItems });
					// Add to active first page cache if present
					prevActive.forEach(([akey, adata]) => {
						if (!adata) return;
						qc.setQueryData(akey as any, { ...adata, items: [item, ...adata.items] });
					});
				}
			});
			return { prevActive, prevArchived };
		},
		onError: (_err, _id, ctx) => {
			if (!ctx) return;
			(ctx.prevActive as any[]).forEach(([key, data]) => qc.setQueryData(key as any, data));
			(ctx.prevArchived as any[]).forEach(([key, data]) => qc.setQueryData(key as any, data));
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["jobs"] });
			qc.invalidateQueries({ queryKey: ["jobs-archived"] });
		},
	});
}

export function useDeleteJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteJobApi(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["jobs"] });
			qc.invalidateQueries({ queryKey: ["jobs-archived"] });
		},
	});
}



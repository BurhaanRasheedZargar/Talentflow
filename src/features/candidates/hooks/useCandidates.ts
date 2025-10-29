import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { createCandidate, deleteCandidateApi, fetchCandidates } from "../../../api/candidates";
import type { PaginatedResponse } from "../../../api/client";
import type { CandidateDto } from "../../../api/candidates";

export function useCandidatesList(params: { page?: number; pageSize?: number; search?: string; stage?: string; jobId?: number } = { page: 1, pageSize: 20 }): UseQueryResult<PaginatedResponse<CandidateDto>> {
    return useQuery<PaginatedResponse<CandidateDto>>({ queryKey: ["candidates", params], queryFn: () => fetchCandidates(params) });
}

export function useCreateCandidate() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: (input: any) => createCandidate(input), onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }) });
}

export function useUpdateCandidate() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, input }: { id: number; input: any }) => fetch(`/candidates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }).then(r => r.json()), onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }) });
}

export function useDeleteCandidate() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: (id: number) => deleteCandidateApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }) });
}



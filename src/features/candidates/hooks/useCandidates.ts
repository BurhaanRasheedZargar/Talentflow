import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCandidate, deleteCandidateApi, fetchCandidates, updateCandidate } from "../../../api/candidates";

export function useCandidatesList(params: { page?: number; pageSize?: number; search?: string; stage?: string; jobId?: number } = { page: 1, pageSize: 20 }) {
	return useQuery({ queryKey: ["candidates", params], queryFn: () => fetchCandidates(params), keepPreviousData: true });
}

export function useCreateCandidate() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: (input: any) => createCandidate(input), onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }) });
}

export function useUpdateCandidate() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: ({ id, input }: { id: number; input: any }) => updateCandidate(id, input), onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }) });
}

export function useDeleteCandidate() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: (id: number) => deleteCandidateApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }) });
}



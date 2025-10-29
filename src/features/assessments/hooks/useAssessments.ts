import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAssessment, deleteAssessmentApi, fetchAssessments, updateAssessment } from "../../../api/assessments";

export function useAssessmentsList(params: { page?: number; pageSize?: number; status?: string; jobId?: number; candidateId?: number } = { page: 1, pageSize: 20 }) {
	return useQuery({ queryKey: ["assessments", params], queryFn: () => fetchAssessments(params), keepPreviousData: true });
}

export function useCreateAssessment() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: (input: any) => createAssessment(input), onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }) });
}

export function useUpdateAssessment() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: ({ id, input }: { id: number; input: any }) => updateAssessment(id, input), onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }) });
}

export function useDeleteAssessment() {
	const qc = useQueryClient();
	return useMutation({ mutationFn: (id: number) => deleteAssessmentApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }) });
}



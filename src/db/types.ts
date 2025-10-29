export type ID = number;

export interface Job {
	id?: ID;
	title: string;
	department: string;
	location: string;
	status: "open" | "paused" | "closed";
	createdAt: number;
	titleLowercase: string;
	slug: string;
	archived?: boolean;
	order: number;
	tags?: string[];
	description?: string;
}

export interface Candidate {
	id?: ID;
	name: string;
	email: string;
	jobId: ID | null;
	stage: "applied" | "screen" | "interview" | "offer" | "rejected" | "hired";
	createdAt: number;
}

export interface Assessment {
	id?: ID;
	candidateId: ID;
	jobId: ID;
	score: number;
	status: "pending" | "completed";
	createdAt: number;
}

export interface CandidateTimelineEntry {
	id?: ID;
	candidateId: ID;
	type: "stage" | "note";
	message: string; // e.g., "moved to screen" or note text with @mentions
	createdAt: number;
}

export interface AssessmentBuilder {
	jobId: ID;
	// simple schema for sections/questions
	sections: Array<{
		title: string;
		questions: Array<{
			id: string;
			type: "single" | "multi" | "short" | "long" | "number" | "file";
			label: string;
			required?: boolean;
			options?: string[];
			min?: number;
			max?: number;
			showIf?: { questionId: string; equals: string };
		}>;
	}>;
}

export interface AssessmentResponse {
	id?: ID;
	jobId: ID;
	candidateId: ID;
	answers: Record<string, any>;
	createdAt: number;
}

export interface User {
	id?: ID;
	username: string;
	email: string;
	name: string;
	role: "admin" | "recruiter" | "viewer";
	createdAt: number;
}

export interface AuthSession {
	userId: ID;
	username: string;
	role: "admin" | "recruiter" | "viewer";
	expiresAt: number;
}

export interface UploadedFile {
	id?: ID;
	filename: string;
	mimeType: string;
	size: number;
	data: ArrayBuffer;
	uploadedAt: number;
	uploadedBy: ID;
}



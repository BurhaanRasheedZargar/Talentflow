import Dexie from "dexie";
import type { Table } from "dexie";
import type { Assessment, AssessmentBuilder, AssessmentResponse, Candidate, CandidateTimelineEntry, Job, User, UploadedFile } from "./types";
import { generateAssessments, generateCandidates, generateJobs } from "./seed";

class TalentflowDB extends Dexie {
	jobs!: Table<Job, number>;
	candidates!: Table<Candidate, number>;
	assessments!: Table<Assessment, number>;
	candidateTimelines!: Table<CandidateTimelineEntry, number>;
	assessmentBuilders!: Table<AssessmentBuilder, number>; // keyed by jobId
	assessmentResponses!: Table<AssessmentResponse, number>;
	users!: Table<User, number>;
	uploadedFiles!: Table<UploadedFile, number>;

	constructor() {
		super("talentflow-db");

		this.version(1).stores({
			jobs: "++id, titleLowercase, status, createdAt",
			candidates: "++id, jobId, email, stage, createdAt",
			assessments: "++id, candidateId, jobId, status, createdAt",
		});

		this.version(2).stores({
			jobs: "++id, titleLowercase, status, createdAt, slug, archived, order",
			candidates: "++id, jobId, email, stage, createdAt",
			assessments: "++id, candidateId, jobId, status, createdAt",
		}).upgrade(async tx => {
			const jobs = await tx.table("jobs").toArray();
			await Promise.all(
				jobs.map((j, index) =>
					tx.table("jobs").update(j.id, {
						slug: (j.title as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
						archived: false,
						order: index,
					})
				)
			);
		});

		this.version(3).stores({
			jobs: "++id, titleLowercase, status, createdAt, slug, archived, order",
			candidates: "++id, jobId, email, stage, createdAt",
			assessments: "++id, candidateId, jobId, status, createdAt",
		});

		this.version(4).stores({
			jobs: "++id, titleLowercase, status, createdAt, slug, archived, order",
			candidates: "++id, jobId, email, stage, createdAt",
			assessments: "++id, candidateId, jobId, status, createdAt",
			candidateTimelines: "++id, candidateId, createdAt",
			assessmentBuilders: "jobId",
			assessmentResponses: "++id, jobId, candidateId, createdAt",
		});

		this.version(5).stores({
			jobs: "++id, titleLowercase, status, createdAt, slug, archived, order",
			candidates: "++id, jobId, email, stage, createdAt",
			assessments: "++id, candidateId, jobId, status, createdAt",
			candidateTimelines: "++id, candidateId, createdAt",
			assessmentBuilders: "jobId",
			assessmentResponses: "++id, jobId, candidateId, createdAt",
			users: "++id, username, email, role",
			uploadedFiles: "++id, uploadedBy, uploadedAt",
		});

		this.on("populate", async () => {
			const jobs = generateJobs(25);
			const jobIds = (await this.jobs.bulkAdd(jobs, { allKeys: true })) as number[];

			const candidates = generateCandidates(1000, jobIds);
			const candidateIds = (await this.candidates.bulkAdd(candidates, { allKeys: true })) as number[];

			for (let i = 0; i < candidates.length; i++) {
				candidates[i].id = candidateIds[i];
			}

			const assessments = generateAssessments(candidates);
			await this.assessments.bulkAdd(assessments);

			// Seed simple candidate timeline entries for stage
			const timelineSeed: CandidateTimelineEntry[] = candidates.slice(0, 200).map(c => ({
				candidateId: c.id!,
				type: "stage",
				message: `Initial stage: ${c.stage}`,
				createdAt: c.createdAt,
			}));
			if (timelineSeed.length) await this.candidateTimelines.bulkAdd(timelineSeed);

			// Seed empty assessment builders for a few jobs
			for (const jid of jobIds.slice(0, 3)) {
				await this.assessmentBuilders.put({ jobId: jid, sections: [] });
			}
		});
	}
}

export const db = new TalentflowDB();

export async function ensureDbReady(): Promise<void> {
	if (!db.isOpen()) {
		await db.open();
	}
}



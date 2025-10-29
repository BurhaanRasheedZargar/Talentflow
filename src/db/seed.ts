import { faker } from "@faker-js/faker";
import type { Assessment, Candidate, Job } from "./types";

export function generateJobs(count: number): Job[] {
	const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Support"];
	const locations = ["Remote", "NYC", "SF", "London", "Berlin", "Tokyo"];
	const statuses: Job["status"][] = ["open", "paused", "closed"];

	return Array.from({ length: count }).map((_, i) => {
		const title = faker.person.jobTitle();
		return {
			title,
			department: faker.helpers.arrayElement(departments),
			location: faker.helpers.arrayElement(locations),
			status: faker.helpers.arrayElement(statuses),
			createdAt: faker.date.recent({ days: 120 }).getTime(),
			titleLowercase: title.toLowerCase(),
			slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
			archived: false,
			order: i,
			tags: faker.helpers.arrayElements(["frontend","backend","fullstack","design","marketing","sales","support"], { min: 0, max: 3 }),
			description: faker.lorem.paragraphs({ min: 1, max: 3 }),
		};
	});
}

export function generateCandidates(count: number, jobIds: number[]): Candidate[] {
	const stages: Candidate["stage"][] = ["applied", "screen", "interview", "offer", "rejected", "hired"];
	return Array.from({ length: count }).map(() => {
		const jobId = faker.helpers.arrayElement([null, ...jobIds, ...jobIds]);
		return {
			name: faker.person.fullName(),
			email: faker.internet.email().toLowerCase(),
			jobId,
			stage: faker.helpers.arrayElement(stages),
			createdAt: faker.date.recent({ days: 180 }).getTime(),
		};
	});
}

export function generateAssessments(candidates: Candidate[]): Assessment[] {
	return candidates
		.filter(c => c.jobId != null)
		.filter(() => Math.random() < 0.4)
		.map(c => ({
			candidateId: c.id!,
			jobId: c.jobId!,
			score: Math.floor(Math.random() * 101),
			status: Math.random() < 0.7 ? "completed" : "pending",
			createdAt: c.createdAt + Math.floor(Math.random() * (14 * 24 * 60 * 60 * 1000)),
		}));
}



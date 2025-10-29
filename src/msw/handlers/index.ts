import { getJobs, postJob, patchJob, reorderJob, archiveJob, unarchiveJob, deleteJob, getArchivedJobs } from "./jobs";
import { getCandidates, postCandidate, patchCandidate, deleteCandidate, getCandidateTimeline, postCandidateTimeline, getCandidateById } from "./candidates";
import { getAssessments, postAssessment, patchAssessment, deleteAssessment, getAssessmentBuilder, putAssessmentBuilder, postAssessmentSubmit } from "./assessments";

export const handlers = [
  getJobs, postJob, patchJob, reorderJob, archiveJob, unarchiveJob, deleteJob, getArchivedJobs,
  getCandidates, getCandidateById, postCandidate, patchCandidate, deleteCandidate, getCandidateTimeline, postCandidateTimeline,
  getAssessments, postAssessment, patchAssessment, deleteAssessment, getAssessmentBuilder, putAssessmentBuilder, postAssessmentSubmit,
];



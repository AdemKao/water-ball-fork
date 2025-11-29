export type GymType = 'MAIN_QUEST' | 'SIDE_QUEST';

export type SubmissionType = 'PDF' | 'MP4' | 'CODE' | 'IMAGE';

export type SubmissionStatus = 'PENDING' | 'REVIEWED' | 'NEEDS_REVISION';

export type ReviewStatus = 'APPROVED' | 'NEEDS_REVISION';

export type PrerequisiteType = 'LESSON' | 'PROBLEM';

export interface Gym {
  id: string;
  journeyId: string;
  journeyTitle: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  type: GymType;
  stageCount: number;
  problemCount: number;
  completedCount: number;
  isPurchased: boolean;
}

export interface GymDetail extends Gym {
  stages: StageSummary[];
  relatedGyms: GymSummary[];
}

export interface GymSummary {
  id: string;
  title: string;
  type: GymType;
}

export interface StageSummary {
  id: string;
  title: string;
  description: string | null;
  difficulty: number;
  problemCount: number;
  completedCount: number;
  isUnlocked: boolean;
  prerequisites: PrerequisiteInfo[];
}

export interface StageDetail {
  id: string;
  gymId: string;
  gymTitle: string;
  title: string;
  description: string | null;
  difficulty: number;
  problems: ProblemSummary[];
  isUnlocked: boolean;
  isPurchased: boolean;
  prerequisites: PrerequisiteInfo[];
}

export interface ProblemSummary {
  id: string;
  title: string;
  difficulty: number;
  submissionTypes: SubmissionType[];
  isCompleted: boolean;
  isUnlocked: boolean;
  submissionStatus: SubmissionStatus | null;
  prerequisites: PrerequisiteInfo[];
}

export interface ProblemDetail {
  id: string;
  stageId: string;
  stageTitle: string;
  gymId: string;
  gymTitle: string;
  title: string;
  description: string;
  difficulty: number;
  submissionTypes: SubmissionType[];
  hints: Hint[];
  expReward: number;
  isUnlocked: boolean;
  prerequisites: PrerequisiteInfo[];
  latestSubmission: SubmissionInfo | null;
  previousProblem: ProblemNav | null;
  nextProblem: ProblemNav | null;
}

export interface Hint {
  order: number;
  content: string;
}

export interface PrerequisiteInfo {
  type: PrerequisiteType;
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ProblemNav {
  id: string;
  title: string;
}

export interface SubmissionInfo {
  id: string;
  status: SubmissionStatus;
  fileUrl: string;
  fileName: string;
  fileType: string;
  submittedAt: string;
  version: number;
  review: ReviewInfo | null;
}

export interface Submission extends SubmissionInfo {
  problemId: string;
  isPublic: boolean;
  fileSizeBytes: number;
}

export interface SubmissionDetail extends Submission {
  problemTitle: string;
  stageTitle: string;
  gymTitle: string;
}

export interface ReviewInfo {
  id: string;
  content: string;
  status: ReviewStatus;
  reviewedAt: string;
  reviewerName: string;
}

export interface PublicSubmission {
  id: string;
  userName: string;
  userAvatarUrl: string | null;
  problemId: string;
  problemTitle: string;
  gymTitle: string;
  fileUrl: string;
  fileName: string;
  status: SubmissionStatus;
  submittedAt: string;
  review: {
    content: string;
    status: ReviewStatus;
    reviewedAt: string;
    reviewerName: string;
  } | null;
}

export interface GymProgressSummary {
  totalGyms: number;
  completedGyms: number;
  totalProblems: number;
  completedProblems: number;
  pendingReviews: number;
  gyms: GymProgressItem[];
}

export interface GymProgressItem {
  gymId: string;
  gymTitle: string;
  type: GymType;
  problemCount: number;
  completedCount: number;
  pendingCount: number;
  progressPercentage: number;
}

export interface VisibilityUpdateRequest {
  isPublic: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const SUBMISSION_TYPE_CONFIG: Record<SubmissionType, {
  label: string;
  accept: string[];
  maxSizeMB: number;
  icon: string;
}> = {
  PDF: {
    label: 'PDF 文件',
    accept: ['application/pdf'],
    maxSizeMB: 50,
    icon: 'FileText',
  },
  MP4: {
    label: '影片',
    accept: ['video/mp4'],
    maxSizeMB: 500,
    icon: 'Video',
  },
  CODE: {
    label: '程式碼',
    accept: ['text/plain', 'application/zip'],
    maxSizeMB: 10,
    icon: 'Code',
  },
  IMAGE: {
    label: '圖片',
    accept: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'],
    maxSizeMB: 10,
    icon: 'Image',
  },
};

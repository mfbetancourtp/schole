export type ChapterStatus = 'completed' | 'in_review' | 'in_progress' | 'pending';

/* ── Main view: Tracking ── */

export interface TrackingSummary {
  completed: number;
  totalChapters: number;
  inProgress: number;
  totalComments: number;
}

export interface ChapterTimeline {
  id: number;
  title: string;
  description: string;
  status: ChapterStatus;
  date: string;
  comments: number;
  files: number;
}

export interface TrackingData {
  summary: TrackingSummary;
  chapters: ChapterTimeline[];
}

/* ── Drawer: Chapter detail ── */

export interface Deliverable {
  id: number;
  name: string;
  url: string;
}

export interface TutorComment {
  id: number;
  author: string;
  role: 'Tutor' | 'Estudiante';
  date: string;
  time: string;
  message: string;
}

export interface ChapterDetail {
  id: number;
  title: string;
  description: string;
  status: ChapterStatus;
  date: string;
  dateLabel: string;
  deliverables: Deliverable[];
  comments: TutorComment[];
}

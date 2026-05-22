export interface SessionsDto {
  id: number;
  institutionId: number;
  courseId: number;
  topicId: number | null;
  name: string;
  description: string;
  dateSince: string;
  dateUntil: string;
  rowOrder: number | null;
  planningWeekId: number;
  urlEvidence: string;
  createdAt: string;
  updatedAt: string;
  countAttendances: number;
  attendancesIsAbsence: number;
  attendancesIsDelayArrival: number;
}

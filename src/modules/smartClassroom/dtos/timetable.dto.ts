export type TimetableStatus = 'draft' | 'published';
export type ScheduleEntryType = 'lecture' | 'lab' | 'tutorial' | 'exam';

/**
 * Matches the real API response for each schedule entry.
 * The API returns denormalized data with names included directly.
 */
export interface ScheduleEntry {
  courseId: string;
  facultyId: string;
  roomId: string;
  day: string;
  startTime: string;
  endTime: string;
  type?: ScheduleEntryType;
  // Denormalized fields from API
  courseName?: string;
  courseCode?: string;
  facultyName?: string;
  roomName?: string;
  roomType?: string;
  timeSlot?: string;
}

export interface TimetableConflict {
  type: string;
  message: string;
}

export interface TimetableMetadata {
  totalHours?: number;
  utilizationRate?: number;
  conflictCount?: number;
}

/**
 * Matches the real API response for a timetable.
 * Uses _id, semester as string, year as number, schedule[] with day as string name.
 */
export interface Timetable {
  _id: string;
  name: string;
  department: string;
  semester: string;
  year: number;
  status: TimetableStatus;
  schedule: ScheduleEntry[];
  conflicts: TimetableConflict[];
  metadata: TimetableMetadata;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GenerateTimetableDto {
  department: string;
  semester: number;
  academicYear: number;
  constraints?: Record<string, unknown> | string;
}

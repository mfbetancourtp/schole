export interface ScheduleCourseDto {
  dayWeek: number;
  startTime: string;
  endTime: string;
  courseName: string;
  teacher: string;
}

export interface TimeTableDayDto {
  day: string;
  schedulesCourses: ScheduleCourseDto[];
}

export type GetTimeTableByCourseGroupDto = TimeTableDayDto[];

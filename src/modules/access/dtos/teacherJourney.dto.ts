export interface JourneyDto {
  id: number;
  name: string;
  abbreviation?: string;
  timeSince?: string;
  timeUntil?: string;
}

export interface PersonalizedJourneyTeacherDto {
  id: number;
  timeSince: string;
  timeUntil: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePersonalizedJourneyTeacherDto {
  timeSince: string;
  timeUntil: string;
}

export interface UpdatePersonalizedJourneyTeacherDto {
  timeSince: string;
  timeUntil: string;
}

export interface TeacherJourneyRecordDto {
  id: number;
  weekDay: number;
  journey: { id: number } | null;
  personalizedJourneysTeacher: {
    id: number;
    timeSince: string;
    timeUntil: string;
  } | null;
}

export interface TeacherJourneysByUserDto {
  [weekDay: string]: {
    day: string;
    records: TeacherJourneyRecordDto[];
  };
}

export interface CreateTeacherJourneyDto {
  weekDay: number;
  journeyId?: number;
  personalizedJourneysTeachersId?: number;
}

export interface UpdateTeacherJourneyDto {
  weekDay: number;
  journeyId?: number;
  personalizedJourneysTeachersId?: number;
}

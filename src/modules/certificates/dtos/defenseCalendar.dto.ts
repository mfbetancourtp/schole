export type DefenseStatus = 'scheduled' | 'completed' | 'cancelled';
export type DefenseModality = 'inPerson' | 'virtual';

export interface DefenseSummary {
  scheduled: number;
  completed: number;
  cancelled: number;
  virtual: number;
  inPerson: number;
}

export type DefenseCalendarStatusApi = 'Programada' | 'Completada' | 'Cancelada';
export type DefenseCalendarFormatApi = 'Presencial' | 'Virtual';

export interface CreateOrUpdateDefenseCalendarBodyDto {
  id?: number;
  applicationProjectsId: number;
  date: string;
  time: string;
  duration: number;
  status: DefenseCalendarStatusApi;
  format: DefenseCalendarFormatApi;
  spaceId: number | null;
  meetingLink: string | null;
}

export interface DefenseCalendarPeopleApi {
  names: string;
  lastnames: string;
  email?: string;
  emails?: string;
}

export interface DefenseCalendarUserApi {
  id: number;
  people: DefenseCalendarPeopleApi;
}

export interface DefenseCalendarTutorApi {
  id: number;
  people: DefenseCalendarPeopleApi;
}

export interface DefenseCalendarApplicationProjectApi {
  id: number;
  name: string;
  applicationType?: string;
  applicantType?: string;
  user?: DefenseCalendarUserApi;
  tutor?: DefenseCalendarTutorApi;
  users?: DefenseCalendarUserApi[];
  members?: DefenseCalendarPeopleApi[];
  juries?: any[];
}

export interface DefenseCalendarSpaceApi {
  id: number;
  name: string;
  code: string;
}

export interface DefenseCalendarItemApi {
  id: number;
  date: string;
  time: string;
  duration: number;
  status: DefenseCalendarStatusApi;
  format: DefenseCalendarFormatApi;
  modality?: DefenseCalendarFormatApi;
  meetingLink: string | null;
  createdAt: string;
  applicationProject: DefenseCalendarApplicationProjectApi;
  space?: DefenseCalendarSpaceApi | null;
}

export interface DefenseCalendarStatsApi {
  scheduled: number;
  completed: number;
  cancelled: number;
  virtual: number;
  inPerson: number;
}

export interface JuryMember {
  id: number;
  name: string;
  initials: string;
}

export interface DefenseListItem {
  id: number;
  title: string;
  studentName: string;
  status: DefenseStatus;
  modality: DefenseModality;
  date: string;
  dayNumber: number;
  monthShort: string;
  timeRange: string;
  location: string;
  meetingLink?: string;
}

export interface DefenseCalendarData {
  summary: DefenseSummary;
  defenses: DefenseListItem[];
}

export interface DefenseDetail {
  id: number;
  title: string;
  status: DefenseStatus;
  studentName: string;
  tutorName: string;
  date: string;
  timeRange: string;
  modality: DefenseModality;
  location: string;
  meetingLink?: string;
  jury: JuryMember[];
}

export interface ProjectOption {
  id: number;
  label: string;
}

export interface NewDefenseForm {
  projectId: number | null;
  date: string;
  startTime: string;
  duration: number;
  status: DefenseStatus;
  modality: DefenseModality;
  location: string;
  meetingLink: string;
}

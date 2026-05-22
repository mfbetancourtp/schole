export interface ObservationGeneralDto {
  degreeId?: number;
  directorObservations?: {
    disciplineNote: string | null;
    disciplineObservations: string | null;
    generalObservations: string | null;
    studentLastnames: string;
    studentNames: string;
    userId: number;
  }[];
  groupId?: number;
}

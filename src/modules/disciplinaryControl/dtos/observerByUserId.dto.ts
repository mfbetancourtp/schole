export interface ParamsGetDirectorObservationsByStudentDto {
  userId: number;
  academicPeriodId?: number;
}
export interface ParamsGetRatingScaleDetailByAcademicPeriodIdAndDegreeIdDto {
  academicPeriodId: number;
  degreeId: number;
}

export interface ParamsCreateOrUpdateDirectorObservationDto {
  degreeId: number;
  groupId: number;
  periodId: number;
  directorObservations: DirectorObservations[];
  onlyNote?: number;
}
interface DirectorObservations {
  studentUserId: number;
  disciplineNote: number;
  manualDisciplineNote?: number | null;
  disciplineObservations?: string | null;
  generalObservations?: string;
}

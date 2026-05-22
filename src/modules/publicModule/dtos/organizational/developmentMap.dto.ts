export interface DevelopmentMapDto {
  organizationalUnit: string;
  organizationalJob: string;
  code: string;
  completed: CompleteDto;
  degrees: DegreesDto[];
}
export interface CompleteDto {
  totalNoOptional: number;
  completedNoOptional: number;
  percentage: string;
}
export interface DegreesDto {
  id: number;
  name: string;
  abbreviation: string;
  subjects: DegreesSubjectDto[];
}
export interface DegreesSubjectDto {
  id: number;
  name: string;
  abbreviation: string;
  isOptional: boolean;
  curriculumSubjectId: number;
  degreeId: number;
  completed: boolean;
}

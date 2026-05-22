export interface SubjectDto {
  id: number;
  name: string;
  code?: string;
  abbreviation?: string;
}

export interface AreaWithSubjectsDto {
  id: number;
  name: string;
  code?: string;
  subjects: SubjectDto[];
}

export interface AreaSubjectSelectionDto {
  id: number;
  area: { id: number; name: string; code: string };
  subject: { id: number; name: string; code: string };
}

export interface CreateAreaSubjectSelectionDto {
  areaId: number;
  subjectId: number;
}

export type EducationType = 'Certificación' | 'Diplomado' | 'Curso' | 'Maestría' | 'Doctorado' | 'Especialización' | 'Otro';

export interface AdditionalEducationDto {
  id: number;
  institution: string;
  type: EducationType;
  title: string;
  studyArea: string;
  startMonth: string;
  startYear: number;
  endMonth: string | null;
  endYear: number | null;
  currentlyStudying: boolean;
  description: string;
}

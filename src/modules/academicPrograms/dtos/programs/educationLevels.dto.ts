import { EducationSublevelsDto } from './educationSublevels.dto';
import { FacultiesDto } from './faculties.dto';
import { ModalityDto } from './modality.dto';

export interface EducationLevelsDto {
  id: number;
  countryCode: string;
  name: string;
  defaultAutoEnrollLevelSubjects: number;
  defaultAutoEnrollDegreeSubjects: number;
  defaultUseCredits: number;
  defaultUseTransversalSubjects: number;
  createdAt: null;
  updatedAt: null;
  educationSublevels: EducationSublevelsDto[];
  faculties: FacultiesDto[];
  modalityDto: ModalityDto[];
}

import { TimestampDto } from './timestamp.dto';
import { CurriculumSubjectDto } from '../../modules/academicPrograms/dtos/curriculumSubject.dto';

export interface SubjectDto extends TimestampDto {
  id?: number;
  institutionId?: number;
  thumbnail?: any;
  areaId?: number;
  name: string;
  lmsTemplateCode?: any;
  abbreviation?: any;
  code?: string;
  shortName?: string;
  credits?: number;
  totalHours?: number;
  subjectType?: string;
  degreeRequirement?: boolean;
  curriculumSubject?: CurriculumSubjectDto;
}

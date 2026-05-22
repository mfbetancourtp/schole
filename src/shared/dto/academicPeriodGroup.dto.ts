import { DegreeWithLevelDto } from './degree.dto';
import { GroupDto } from './group.dto';
import { JourneyDto } from './journey.dto';

export interface AcademicPeriodGroupDto {
  id: number;
  institutionId: number;
  degreeId: number;
  journeyId: number;
  academicPeriodId: number;
  courseName: string;
  quota?: number;
  degree: DegreeWithLevelDto;
  journey: JourneyDto;
  group: GroupDto;
}

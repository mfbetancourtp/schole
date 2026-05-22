import { JourneyDto } from '../../institutionalConfiguration/dtos/journey.dto';
import { GroupDto } from '../../../shared/dto/group.dto';
import { DegreeDto } from '../../../shared/dto/degree.dto';
import { PlayTimesDto } from '../../../shared/dto/playTimes.dto';
import { LevelDto } from '../../../shared/dto/level.dto';
import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';

export interface AcademicPeriodGroupsRelatedDataFormDto {
  academicPeriods: AcademicPeriodDto[];
  journeys: JourneyDto[];
  levels: LevelDto[];
  degrees: DegreeDto[];
  groups: GroupDto[];
  playTimes: PlayTimesDto[];
}

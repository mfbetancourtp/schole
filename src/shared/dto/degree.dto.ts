import { TimestampDto } from './timestamp.dto';
import { GroupDto } from './group.dto';
import { PlayTimesDto } from './playTimes.dto';
import { LevelDetail } from './level.dto';

export interface DegreeDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail?: any;
  levelId: number;
  name: string;
  abbreviation?: any;
  groups: GroupDto[];
  playTimes: PlayTimesDto[];
}

export interface DegreeWithLevelDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: any;
  levelId: number;
  name: string;
  abbreviation: string;
  level: LevelDetail;
}

import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface LevelDto {
  createdAt?: any;
  updatedAt: string;
  id: number;
  institutionId: number;
  thumbnail: string;
  name: string;
  abbreviation: string;
}

export interface DegreeDto {
  createdAt?: any;
  updatedAt: string;
  id: number;
  institutionId: number;
  thumbnail: string;
  levelId: number;
  name: string;
  abbreviation: string;
  level: LevelDto;
}

export interface JourneyDto {
  createdAt: string;
  updatedAt: string;
  id: number;
  institutionId: number;
  name: string;
  abbreviation: string;
}

export interface GroupDto {
  createdAt: string;
  updatedAt: string;
  id: number;
  institutionId: number;
  name: string;
  abbreviation: string;
}

export interface RoleDto {
  name: string;
  code: string;
  cheked: boolean;
}

export interface AcademicPeriodsGroupDto extends TimestampDto {
  id: number;
  degreeId: number;
  journeyId: number;
  groupId: number;
  name: string;
  directorPeopleId: number;
  quota: number;
  degree: DegreeDto;
  journey: JourneyDto;
  group: GroupDto;
  roles: RoleDto[];
}

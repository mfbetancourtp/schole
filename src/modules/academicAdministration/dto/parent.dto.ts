import { PeopleDetailDto } from '../../../shared/dto/people.dto';
import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface parentDto extends TimestampDto {
  id: number;
  institutionId: number;
  matriculateId: number;
  guardianPeopleId: number;
  relationshipId: number;
  isEconomicManager: number;
  isEmergencyContact: number;
  people: PeopleDetailDto;
}

export interface ParentDetailDto extends TimestampDto {
  id: number;
  institutionId: number;
  matriculateId: number;
  guardianPeopleId: number;
  relationshipId: number;
  isEconomicManager: number;
  isEmergencyContact: number;
  relationship: RelationshipDto;
  people: PeopleDetailDto;
}
export interface RelationshipDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  grade: any;
}

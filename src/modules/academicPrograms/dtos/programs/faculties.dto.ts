import { TimestampDto } from '../../../../shared/dto/timestamp.dto';

export interface FacultiesDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  deanPeopleId: string;
  createdAt: string;
  updatedAt: string;
}

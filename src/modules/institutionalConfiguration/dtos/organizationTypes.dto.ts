import { TimestampDto } from '../../../shared/dto/timestamp.dto';
export interface OrganizationTypesDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  description: string;
}

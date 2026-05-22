import { TimestampDto } from '../../../shared/dto/timestamp.dto';
export interface ModalityTypesDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  description: string;
}

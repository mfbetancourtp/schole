import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface CompanyAreaDto extends TimestampDto {
  id: number;
  name: string | undefined;
}

import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ScholInsuranceDto extends TimestampDto {
  id: number;
  name: string | undefined;
}

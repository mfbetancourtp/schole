import { TimestampDto } from './timestamp.dto';

export interface CertificateDto extends TimestampDto {
  id: number;
  name: string;
}

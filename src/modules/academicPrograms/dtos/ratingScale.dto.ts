import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface DetailDto extends TimestampDto {
  id: number;
  ratingScaleId: number;
  abbreviation: string;
  description: string;
  minimumValue: number;
  maximumValue: number;
  urlImage: string;
  lowScale: number;
  color: string;
  detail: string;
  isImprovement: any;
}

export interface RatingScaleDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  abbreviation: string;
  description: string;
  details: DetailDto[];
}

import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface EducationTypeDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  description: string;
  parentId: number | null;
  educationCategoryId: number | null;
  children?: EducationTypeDto[];
}

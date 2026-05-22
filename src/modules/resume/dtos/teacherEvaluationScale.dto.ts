export interface TeacherEvaluationScaleDto {
  id: number;
  isActive: boolean;
  name: string;
  description: string | null;
  minimumOverallScore: number;
  maximumOverallScore: number;
  tieStanding: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherEvaluationScalePaginationDto {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TeacherEvaluationScaleResponseDto {
  data: TeacherEvaluationScaleDto[];
  pagination?: TeacherEvaluationScalePaginationDto;
}

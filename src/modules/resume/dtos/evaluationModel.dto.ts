export interface EvaluationModelTeacherEvaluationScaleDto {
  id: number;
  name: string;
}

export interface EvaluationModelDto {
  id: number;
  name: string;
  description: string | null;
  version: string;
  isActive: boolean | number;
  teacherEvaluationScaleId: number | null;
  createdAt: string;
  updatedAt: string;
  teacherEvaluationScale: EvaluationModelTeacherEvaluationScaleDto | null;
}

export interface EvaluationModelPaginationDto {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface EvaluationModelResponseDto {
  data: EvaluationModelDto[];
  pagination?: EvaluationModelPaginationDto;
}

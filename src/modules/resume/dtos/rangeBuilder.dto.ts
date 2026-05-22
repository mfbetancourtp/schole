export interface RangeBuilderTeacherEvaluationScaleDto {
  id: number;
  name: string;
}

export interface RangeBuilderDto {
  id: number;
  teacherEvaluationScaleId: number;
  from: number;
  to: number;
  classificationName: string;
  color: string;
  hierarchyLevel: number;
  createdAt: string;
  updatedAt: string;
  teacherEvaluationScale?: RangeBuilderTeacherEvaluationScaleDto;
}

export interface RangeBuilderPaginationDto {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RangeBuilderResponseDto {
  data: RangeBuilderDto[];
  pagination?: RangeBuilderPaginationDto;
}

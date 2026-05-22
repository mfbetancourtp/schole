export interface AssessmentScaleOption {
  id?: number;
  evaluationScaleId?: number;
  label: string;
  value: number;
  description?: string;
  position?: number;
  color?: string;
}

export type ScaleType = string;

export interface AssessmentScaleDto {
  id: number;
  name: string;
  description?: string;
  type?: ScaleType;
  maxValue?: number;
  isDefault?: boolean;
  options?: AssessmentScaleOption[];
}

export interface CreateAssessmentScaleDto {
  name: string;
  description?: string;
  type?: ScaleType;
  maxValue?: number;
  isDefault?: boolean;
  options?: Omit<AssessmentScaleOption, 'id' | 'evaluationScaleId'>[];
}

export interface UpdateAssessmentScaleDto extends CreateAssessmentScaleDto {}

export interface GetAssessmentScalesParams {
  page?: number;
  perPage?: number;
  search?: string;
  order?: 'ASC' | 'DESC';
  noPag?: string;
}

export interface GetAssessmentScalesResponseDto {
  data: AssessmentScaleDto[];
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ScaleTypeOption {
  value: string;
  label: string;
}

export interface GetScaleRelatedDataResponseDto {
  statusCode: number;
  data: {
    scaleTypes: ScaleTypeOption[];
  };
}

// Keep for backwards compatibility with form internal use
export interface AssessmentScaleLevel {
  id?: number;
  value: number;
  label: string;
  description?: string;
  color?: string;
}

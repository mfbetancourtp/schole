export interface EvaluationScale {
  id: number;
  name: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  labels?: string[];
}

export interface GetEvaluationScalesParams {
  page?: number;
  perPage?: number;
  search?: string;
  order?: 'ASC' | 'DESC';
  noPag?: boolean;
  institutionId?: number | string;
}

export interface GetEvaluationScalesResponseDto {
  data: EvaluationScale[];
  total?: number;
}

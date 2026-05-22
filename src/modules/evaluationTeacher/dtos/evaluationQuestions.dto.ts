export interface EvaluationQuestionOptionDto {
  id: number;
  label: string;
  value: number;
}

export interface EvaluationQuestionResponseDto {
  score?: number;
  answer?: string;
}

export interface EvaluationQuestionDto {
  id: number;
  description: string;
  typeQuestion: 'scale' | 'unscored';
  isRequired: boolean;
  weight: number;
  options?: EvaluationQuestionOptionDto[];
  response?: EvaluationQuestionResponseDto;
}

export interface EvaluationDimensionDto {
  id: number;
  name: string;
  questions: EvaluationQuestionDto[];
}

export interface EvaluationQuestionsDataDto {
  evaluation: {
    id: number;
    templateId: number;
    name: string;
    description: string;
    startDate?: string;
    endDate?: string;
  };
  teacher: {
    fullName: string;
  };
  subject: {
    name: string;
  };
  dimensions: EvaluationDimensionDto[];
}

export interface EvaluationQuestionsResponseDto {
  statusCode: number;
  data: EvaluationQuestionsDataDto;
}

export interface SaveAnswerItemDto {
  dimensionQuestionId: number;
  score?: number;
  answer: string;
}

export interface SaveEvaluationAnswersDto {
  assignmentId: number;
  responses: SaveAnswerItemDto[];
}

export interface SurveySectionFieldsDto {
  surveySectionId: number;
  surveyId: number;
  title: string;
  description?: string;
  fields: FieldDto[];
}

export interface FieldDto {
  questionId: number;
  typeDataId: number;
  typeData: string;
  field: string;
  isRequired: number;
  value?: string;
  answerOptionId: any;
  answerOptions: AnswerOptionDto[];
}

export interface AnswerOptionDto {
  id: number;
  text: string;
  value: string;
}

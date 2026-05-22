export interface AnswerOptionDto {
  id: number;
  questionId: number;
  text: string;
  isOpen: number | boolean;
  value: string;
  order: number;
}

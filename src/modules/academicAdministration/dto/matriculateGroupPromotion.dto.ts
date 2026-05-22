export interface MatriculateGPDto {
  student: string;
  id: number;
  studentId: number;
  studentCategoryId?: number | null;
  state: number;
  numberSubjectsReproved: number;
  isPromoted: boolean;
  Identification: number;
  code: number;
}

export interface BudgetReportDto {
  detailsReport: DetailsReportDto[];
  data: DataDto[];
}
export interface DetailsReportDto {
  curriculumName: string;
  id: number;
  coursesName: string;
  status: string;
  assistants: number;
  planning: number;
  executed: number;
}
export interface DataDto {
  heading: string;
  academicPeriod: string;
  budgetTotal: number;
  planning: number;
  executed: number;
  earring: number;
}

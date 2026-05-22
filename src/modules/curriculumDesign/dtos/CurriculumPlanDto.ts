export interface CurriculumPlanDto {
  id: number;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

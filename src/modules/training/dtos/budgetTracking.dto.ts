export interface PeriodsDto {
  id: number;
  institutionId: number;
  courseId: number;
  periodId: number;
  title: string;
  starDate: string;
  endDate: string;
  isApproved: string;
  range: string;
  approvedUserId: number;
}

export interface PlanningWeekDto {
  courseId: number;
  periodId: number;
  title: string;
  starDate: string;
  endDate: string;
  budgetCategoriesName: string | null;
  id: number;
  planningWeekId: number;
  budgetCategoryId: number | null;
  requiredDate: string | null;
  description: string | null;
  budgetAmount: number | null;
  budgetUnitValue: number | null;
  budgetTotalValue: number | null;
  finalAmount: number;
  finalUnitValue: number;
  finalTotalValue: number;
  urlConsolidateEvidence: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PlanningWeekBudgetsByParams {
  finalAmount: number | null;
  finalUnitValue: number | null;
  finalTotalValue: number | null;
}

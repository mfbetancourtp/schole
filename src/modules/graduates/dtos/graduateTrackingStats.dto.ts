export interface GraduateTrackingEmployabilityEvolutionDto {
  year: number;
  totalEmployed: number;
  percentage: number;
}

export interface GraduateTrackingEmploymentStatusDto {
  label: string;
  total: number;
  percentage: number;
}

export interface GraduateTrackingGraduatesAreaDto {
  area: string;
  totalApplications: number;
  percentage: number;
}

export interface GraduateTrackingStatsDto {
  totalGraduates: number;
  totalEmployed: number;
  totalUnemployed: number;
  employabilityRate: number;
  averageSalary: number;
  avgEmploymentMonths: number;
  graduatesArea: GraduateTrackingGraduatesAreaDto[];
  employabilityEvolution: GraduateTrackingEmployabilityEvolutionDto[];
  estadoLaboral: GraduateTrackingEmploymentStatusDto[];
}

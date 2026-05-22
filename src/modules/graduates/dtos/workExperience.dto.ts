export interface WorkExperienceDto {
  id: number;
  position: string;
  company: string;
  professionalArea: string;
  city: string;
  startMonth: string;
  startYear: number;
  endMonth: string | null;
  endYear: number | null;
  currentJob: boolean;
  description: string;
}

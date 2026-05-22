export interface ProfessionalProfileCompletionModulesDto {
  ProfessionalProfile: boolean;
  AcademicBackground: boolean;
  SupplementaryTraining: boolean;
  WorkExperience: boolean;
  TeachingExperience: boolean;
  IntellectualProduction: boolean;
  AcademicEvents: boolean;
  Recognition: boolean;
}

export interface ProfessionalProfileCompletionDto {
  percentage: number;
  totalModules: number;
  completedModules: number;
  modules: ProfessionalProfileCompletionModulesDto;
}

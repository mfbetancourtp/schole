export interface ScholarshipDto {
  id: number;
  name: string;
  description: string;
  type: string;
  typeLabel: string;
  icon: string;
  iconColor: string;
  image?: string;
  year: string;
  status: 'active' | 'upcoming' | 'closed';
  coverage: string;
  deadline: string;
  isDeadlineClose: boolean;
  availableSlots: number;
  requirements: string[];
  additionalInfo?: string;
  canApply: boolean;
}

export interface EligibilityCheckDto {
  requirement: string;
  requiredValue: string;
  userValue: string;
  passes: boolean;
}

export interface ScholarshipRequirementDto {
  id: number;
  requirementType: string;
  operator: string;
  value: number | string;
  isRequired: number;
}

export interface TypeScholarshipDto {
  id: number;
  name: string;
  description?: string;
  abbreviation?: string;
  defaultRequirements?: Array<{
    id: number;
    scholarshipRequirementId: number;
    scholarshipRequirement: ScholarshipRequirementDto;
  }>;
}

export interface ScholarshipCatalogItemDto {
  id: number;
  name: string;
  code?: string;
  statusScholarship?: string;
  percentage?: number;
  enrollmentPercentage?: number;
  fixedValue?: number;
  MaximumAmount?: number;
  benefitDuration?: number;
  capacity?: number;
  availableCapacity?: number;
  totalBudget?: number;
  startDate?: string;
  endDate?: string;
  publicationDate?: string;
  photoUrl?: string;
  typeScholarship?: TypeScholarshipDto;
  academicPeriod?: { id: number; name: string };
  academicLevel?: { id: number; name: string };
  faculty?: { id: number; name: string };
  academicProgram?: { id: number; name: string };
  studentType?: { id: number; name: string };
  requirements?: string[];
  additionalInfo?: string;
}

export interface ScholarshipCatalogPaginatedDto {
  data: ScholarshipCatalogItemDto[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ScholarshipCatalogResponseDto {
  data: ScholarshipCatalogItemDto;
}

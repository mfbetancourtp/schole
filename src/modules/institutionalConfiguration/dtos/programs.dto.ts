export interface ProgramDto {
  id?: number;
  code: string;
  name: string;
  educationTypeId: number;
  operationalSchemeId?: number;
  departmentId?: number | null;
  directorUserId?: number | null;
  modalityTypeId: number;
  periodTypeId: number;

  // Academic Info
  qualifiedRegistration: string;
  sniesCode: string;
  internalRecord?: string;
  internalStandard?: string;
  programTitle: string;
  ratingScaleId?: number;
  dayTrip?: string; // "Diurna / Nocturna"

  // Institutional Structure
  organizationId: number;

  // Program Details
  targetAudience?: string;
  programDuration?: string;
  programValue?: string;
  requirements?: string;
  additionalInfo?: string;

  // Additional New Fields
  initialStatus?: string;
  validityStartDate?: string;
  approvalResolution?: string;
  approvalDate?: string;
  effectiveDate?: string;
  expirationDate?: string;
  registrationExpirationDate?: string;
  hasHighQualityAccreditation?: boolean | number;
  researchLines?: string | string[];
  occupationalFields?: string | string[];
  maximumCapacity?: number | null;
  minimumCapacity?: number | null;
  createdAt?: string;
  updatedAt?: string;

  // Additional Info (legacy fields - might be removed)
  studentProfile?: string;
  admissionRequirements?: string;
  description?: string;

  // Status
  isActive?: boolean;
  state?: string;
  status?: string;

  // Relations (optional for display)
  educationType?: { id: number; name: string };
  modalityType?: { id: number; name: string };
  periodType?: {
    id: number;
    name: string;
    code?: string;
    description?: string | null;
  };
  organization?: {
    id: number;
    institutionId: number;
    name: string;
    code: string;
    description: string;
    organizationTypeId: number;
    parentId: number | null;
    createdAt?: string;
    updatedAt?: string;
  };
  department?: {
    id: number;
    name: string;
    director?: {
      id: number;
      people?: {
        firstName?: string | null;
        secondName?: string | null;
        firstLastname?: string | null;
        secondLastname?: string | null;
        names?: string | null;
        lastnames?: string | null;
      };
    };
    faculty?: {
      id: number;
      name: string;
      director?: {
        id: number;
        people?: {
          firstName?: string | null;
          secondName?: string | null;
          firstLastname?: string | null;
          secondLastname?: string | null;
          names?: string | null;
          lastnames?: string | null;
        };
      };
    };
  };
  ratingScale?: {
    id: number;
    title: string;
    abbreviation?: string | null;
  };
  operationalScheme?: {
    id: number;
    name: string;
    code?: string;
    programTypeId?: number | null;
    semesterNumber?: number | null;
    creditsNumber?: number | null;
    classWeeks?: number | null;
    evaluationWeeks?: number | null;
    semesterHours?: number | null;
    programType?: {
      id: number;
      name: string;
    };
    periodType?: {
      id: number;
      name: string;
      code?: string;
      description?: string | null;
    };
  };
  director?: {
    id: number;
    people?: {
      firstName?: string | null;
      secondName?: string | null;
      firstLastname?: string | null;
      secondLastname?: string | null;
      names?: string | null;
      lastnames?: string | null;
    };
  };
  competencies?: Array<{
    id: number;
    name: string;
    code?: string | null;
    competencyType?: string | null;
  }>;
  programCurriculums?: Array<{
    id: number;
    name: string;
    state?: string | null;
    curriculumPeriods?: Array<{
      id: number;
    }>;
  }>;
}

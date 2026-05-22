export interface ScholarshipApplicationRequiredDocumentDto {
  id: number;
  name: string;
  description?: string;
  isRequired?: boolean;
}

export interface ScholarshipApplicationInfoResponseDto {
  people?: {
    id: number;
    names?: string;
    lastnames?: string;
    identification?: string;
    email?: string;
    mobile?: string;
    direction?: string;
    studentCode?: string;
  };
  scholarship?: {
    id: number;
    name?: string;
    percentage?: number;
    benefitDuration?: number;
    typeScholarship?: {
      id: number;
      name?: string;
      requiredDocuments?: Array<{
        id: number;
        scholarshipDocument?: {
          id: number;
          code?: string;
          name?: string;
          abjuntoType?: string;
        };
      }>;
    };
  };
}

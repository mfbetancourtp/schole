export interface ConvocationListItemAcademicPeriod {
  id: number;
  name: string;
}

export interface ConvocationListItemProgram {
  id: number;
  name: string;
}

export interface ConvocationListItemDto {
  id: number;
  title: string;
  status: string;
  statusLabel: string;
  stepsCount: number;
  applicantsCount: number;
  thumbnail?: string;
  startDate?: string;
  endDate?: string;
  academicPeriod: ConvocationListItemAcademicPeriod;
  programs: ConvocationListItemProgram[];
}

export interface ConvocationsPaginationDto {
  page: number;
  perPage: number;
  total: number;
  lastPage?: number;
}

export interface PaginatedConvocationsDto {
  data: ConvocationListItemDto[];
  pagination: ConvocationsPaginationDto;
}

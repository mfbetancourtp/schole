export interface RelatedDataDto {
  organizationalUnits: OrganizationalUnitsDto[];
  organizationalJobs: OrganizationalJobsDto[];
  employees: EmployeesDto[];
  status: CourseInscriptionStatusDto[];
}
export interface OrganizationalUnitsDto {
  id: number;
  institutionId: number;
  campusId: string;
  code: string;
  name: string;
  phoneNumber: string;
  mail: string;
  hierarchicalLevel: string;
  hierarchicalKey: string;
  unitColor: string;
  createdAt: string;
  updatedAt: string;
}
export interface OrganizationalJobsDto {
  id: number;
  organizationalUnitId: number;
  code: string;
  name: string;
  mission: string;
  baseKnowledge: string;
  complementaryKnowledge: string;
  technicalKnowledge: string;
  hierarchicalLevel: number;
  hierarchicalKey: string;
  parentOrganizationalJobId: number;
  createdAt: string;
  updatedAt: string;
}
export interface EmployeesDto {
  id: number;
  employee: string;
  organizationalJobId: number;
}

export interface CourseInscriptionStatusDto {
  label: string;
  value: string;
}

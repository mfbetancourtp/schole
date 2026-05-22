export type TeacherAvailabilityState = 'disponible' | 'cercano' | 'completo';
export type TeacherAvailabilityApiState = 'available' | 'near_limit' | 'no_availability';
export type LoadAssignmentState = 'asignado' | 'pendiente' | 'error';
export type LoadAssignmentApiState = 'assigned' | 'pending' | 'error';
export type LoadCreationType = 'desde-cero' | 'duplicar';

export interface SelectOption<T = string | number> {
  id: T;
  name: string;
}

export interface AcademicLoadProgramType {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  description: string | null;
  isCurricular: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AcademicLoadPeriod {
  id: number;
  institutionId: number;
  code: string;
  name: string;
  programTypeId: number;
  startDate: string;
  endDate: string;
  active: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  programType?: AcademicLoadProgramType;
  programsCount?: number;
}

export interface AcademicLoadProgram {
  id: number;
  institutionId: number;
  departmentId: number | null;
  name: string;
  code: string;
  state: string;
  programTitle?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  department?: {
    faculty?: {
      campuses?: AcademicLoadCampus[];
    };
  };
}

export interface AcademicLoadCampus {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  description: string | null;
  directorUserId: number | null;
  organizationTypeId: number | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AcademicLoadContractType {
  id: number;
  institutionId: number;
  name: string;
  code: string;
  minHours: number;
  maxHours: number;
  description: string;
  isActive: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TeacherSubjectAssignmentSummary {
  codigo?: string;
  nombre: string;
  grupo: string;
  horas: number;
  semestre?: number;
}

export interface LoadTeacherSelectOption {
  id: number;
  nombre: string;
  tipoContrato: string;
  horasAsignadas: number;
  horasDisponibles: number;
  horasMaximas: number;
  estado: TeacherAvailabilityState;
  codigo?: string;
  programa?: string;
}

export interface TeacherBankTeacher {
  id: number;
  contractRecordId?: number | null;
  teacherId?: number;
  academicPeriodId?: number;
  contractTypeId?: number | null;
  peopleId?: number;
  userId?: number;
  avatar?: string | null;
  identification?: string;
  nombre: string;
  tipoContrato: string;
  horasAsignadas: number;
  horasDisponibles?: number;
  horasMaximas: number;
  estado: TeacherAvailabilityState;
  statusLabel?: string;
  programa: string;
  asignaturas: TeacherSubjectAssignmentSummary[];
}

export interface TeacherBankStatusOption {
  value: TeacherAvailabilityApiState;
  label: string;
  count: number;
}

export interface ContractTypeRulesResponse {
  data: AcademicLoadContractType[];
  pagination: TeacherContractsPagination;
}

export interface ContractTypesStatsData {
  total: number;
  active: number;
  inactive: number;
}

export interface ContractTypesStatsResponse {
  statusCode: number;
  data: ContractTypesStatsData;
}

export interface TeacherBankStatsData {
  total: number;
  statusOptions: TeacherBankStatusOption[];
}

export interface TeacherBankStatsResponse {
  statusCode: number;
  data: TeacherBankStatsData;
}

export interface TeacherContractItem {
  id: number | null;
  institutionId: number;
  teacherId: number;
  academicPeriodId: number;
  contractTypeId: number | null;
  assignedHours: number;
  status: TeacherAvailabilityApiState | null;
  createdAt: string;
  updatedAt: string;
  contractType: AcademicLoadContractType | null;
  peopleId: number;
  userId: number;
  avatar: string | null;
  identification: string;
  fullName: string;
  maxHours: number;
  availableHours: number;
  statusLabel: string;
}

export interface TeacherContractsPagination {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TeacherContractsData {
  data: TeacherContractItem[];
  pagination: TeacherContractsPagination;
}

export interface TeacherContractsResponse {
  statusCode: number;
  data: TeacherContractsData;
}

export interface TeacherContractsDatatableResponse {
  data: TeacherContractItem[];
  total: number;
  page: number;
  pagination: TeacherContractsPagination;
}

export interface LoadManagementStatusOption {
  key: LoadAssignmentApiState;
  label: string;
}

export interface LoadManagementStatsData {
  totalSubjects: number;
  assignedPercentage: number;
  pendingCount: number;
  status: LoadManagementStatusOption[];
}

export interface LoadManagementStatsResponse {
  statusCode: number;
  data: LoadManagementStatsData;
}

export interface LoadAssignment {
  id: number;
  codigo: string;
  nombre: string;
  grupo: string;
  semestre: number;
  intensidadHoraria: number;
  docenteId: number | null;
  tipoContrato: string;
  estado: LoadAssignmentState;
  periodo: string;
  programa: string;
  esTransversal?: boolean;
}

export interface LoadingRule {
  id: number;
  tipoContrato: string;
  horasMaximas: number;
  horasMinimas: number;
  descripcion: string;
  activa: boolean;
}

export interface PreviousPeriodSummary {
  asignaturas: number;
  docentes: number;
  completado: number;
}

export interface LoadCreationData {
  periodo: string;
  programa: string;
  nombreProceso: string;
  tipoCreacion: LoadCreationType;
  periodoBase?: string;
  incluirSinDocente: boolean;
  marcarConflictos: boolean;
}

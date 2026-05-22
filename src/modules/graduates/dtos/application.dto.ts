export type ApplicationStatus = 'enviada' | 'en_revision' | 'preseleccionado' | 'entrevista' | 'oferta' | 'rechazado' | 'retirado';

export interface ApplicationDto {
  id: number;
  vacancyId: number;
  vacancyTitle: string;
  company: string;
  companyLogo?: string;
  city: string;
  modality: string;
  appliedAt: string;
  status: ApplicationStatus;
  coverLetter?: string;
  cvFileId?: number;
  portfolioUrl?: string;
}

export interface JobVacancyApplicationApiDto {
  id: number;
  jobVacanciesId: number;
  peopleId: number;
  graduateFilesId: number;
  coverLetter: string;
  briefcaseLink: string;
  authorizeData: boolean;
  applicationStatus: string;
  createdAt?: string;
  jobVacancy?: {
    id: number;
    name: string;
    company?: { name: string; logo?: string };
    municipality?: { name: string };
    modalityType?: { name: string };
  };
}

const STATUS_MAP: Record<string, ApplicationStatus> = {
  Enviada: 'enviada',
  'En Revisión': 'en_revision',
  'En revision': 'en_revision',
  Preseleccionado: 'preseleccionado',
  Entrevista: 'entrevista',
  Oferta: 'oferta',
  Rechazado: 'rechazado',
  Retirado: 'retirado',
};

export const mapApiApplication = (a: any): ApplicationDto => {
  const vacancy = a.jobVacancy ?? a.vacancy ?? null;
  const company = vacancy?.company ?? a.company ?? null;
  return {
    id: a.id,
    vacancyId: a.jobVacanciesId ?? vacancy?.id,
    vacancyTitle: vacancy?.name ?? a.vacancyTitle ?? '',
    company: typeof company === 'string' ? company : company?.name ?? '',
    companyLogo: company?.logo ?? undefined,
    city: vacancy?.municipality?.name ?? a.city ?? '',
    modality: vacancy?.modalityType?.name ?? a.modality ?? '',
    appliedAt: a.createdAt ?? a.appliedAt ?? new Date().toISOString(),
    status: STATUS_MAP[a.applicationStatus] ?? (a.status as ApplicationStatus) ?? 'enviada',
    coverLetter: a.coverLetter,
    cvFileId: a.graduateFilesId ?? a.cvFileId,
    portfolioUrl: a.briefcaseLink ?? a.portfolioUrl,
  };
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  enviada: 'Enviada',
  en_revision: 'En revisión',
  preseleccionado: 'Preseleccionado',
  entrevista: 'Entrevista',
  oferta: 'Oferta recibida',
  rechazado: 'No seleccionado',
  retirado: 'Retirada',
};

export const APPLICATION_STATUS_COLOR: Record<ApplicationStatus, string> = {
  enviada: '#6c757d',
  en_revision: '#0d6efd',
  preseleccionado: '#198754',
  entrevista: '#0dcaf0',
  oferta: '#ffc107',
  rechazado: '#dc3545',
  retirado: '#adb5bd',
};

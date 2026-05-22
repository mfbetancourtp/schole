import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AdminApplicationListItemDto } from '../dtos/adminApplications.dto';

export interface GetScholarshipApplicationsParams {
  page?: number;
  perPage?: number;
  noPag?: string;
  search?: string;
  statusCode?: string;
  scholarshipSettingsId?: number;
  institutionId?: number;
  sort?: string;
  order?: string;
}

export interface ScholarshipApplicationsListResponseDto {
  data: AdminApplicationListItemDto[];
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}

export class GetScholarshipApplicationsAdminService {
  run(params?: GetScholarshipApplicationsParams) {
    return axios.get<ScholarshipApplicationsListResponseDto>(`${services.structure}/scholarship-applications`, { params }).then((r) => r.data);
  }
}

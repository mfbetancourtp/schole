import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipStatusDto, ScholarshipStatusPaginatedDto } from '../dtos/scholarshipStatus.dto';

export class GetScholarshipStatusesWithDetailsService {
  run(params?: any) {
    // First, get the list of statuses, then get detailed info for each
    return axios.get<ScholarshipStatusPaginatedDto>(`${services.structure}/scholarship-statuses`, { params }).then((listResponse) => {
      // Get complete details for each status (with nextStatuses)
      return Promise.all(
        (listResponse.data.data || []).map(
          (status) =>
            axios
              .get<ScholarshipStatusDto>(`${services.structure}/scholarship-statuses/${status.id}`)
              .then((response) => response.data)
              .catch(() => status) // If detail fetch fails, return basic status
        )
      ).then((statusesWithDetails) => ({
        data: statusesWithDetails,
        pagination: listResponse.data.pagination,
      }));
    });
  }
}

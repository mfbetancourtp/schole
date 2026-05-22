import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetOfferingSectionsByPeriodSubjectService {
  async run(periodSubjectId: number, curriculumOfferingId: number) {
    return axios
      .get(`${services.academic}/planning/offering-sections/${periodSubjectId}/by-period-subject`, {
        params: { curriculumOfferingId },
      })
      .then((response) => response.data);
  }
}

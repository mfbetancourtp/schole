import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export interface EnrollmentSubjectSelectionParams {
  curriculumOfferingId: number;
  curriculumPeriodId: number;
  onlyIsDegreeRequirement?: number;
  onlyFailed?: number;
}

export class GetEnrollmentSubjectSelectionService {
  async run(params: EnrollmentSubjectSelectionParams) {
    return axios.get(`${services.academicAdministration}/matriculate-subjects/enrollment-selection`, { params }).then((response) => response.data);
  }
}

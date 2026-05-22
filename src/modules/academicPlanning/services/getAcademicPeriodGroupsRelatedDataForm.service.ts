import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IGetAcademicPeriodGroupsRelatedDataFormService {
  journeyId: number;
}
export class GetAcademicPeriodGroupsRelatedDataFormService {
  async run(params?: IGetAcademicPeriodGroupsRelatedDataFormService) {
    return axios.get(`${services.academic}/academic-planning/academic-period-groups-related-data-form`, { params }).then((response) => response.data);
  }
}

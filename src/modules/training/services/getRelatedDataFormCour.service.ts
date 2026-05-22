import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetRelatedDataFormCourService {
  async run(academicPeriodId: number) {
    return axios.get<any>(`${services.classroom}/classroom-administration/related-data-form-courses?academicPeriodId=${academicPeriodId}`).then((response) => response.data);
  }
}

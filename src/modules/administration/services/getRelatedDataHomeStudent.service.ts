import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IGetRelatedDataHomeStudentService {
  userId: number;
}

export class GetRelatedDataHomeStudentService {
  async run(params?: IGetRelatedDataHomeStudentService) {
    return axios
      .get(
        `${services.classroom}/classroom-administration/related-data-home-student`,
        { params }
      )
      .then((response) => response.data);
  }
}

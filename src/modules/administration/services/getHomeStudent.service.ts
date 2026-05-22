import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IGetHomeStudentService {
  userId: number;
}

export class GetHomeStudentService {
  async run(params?: IGetHomeStudentService) {
    return axios
      .get(`${services.classroom}/classroom-administration/home-student`, {
        params,
      })
      .then((response) => response.data);
  }
}

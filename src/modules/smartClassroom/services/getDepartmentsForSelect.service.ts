import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDepartmentsForSelectService {
  async run(params: { search?: string }) {
    return axios
      .get(`${services.structure}/subjects/departments`, {
        params: {
          order: 'ASC',
          page: 1,
          perPage: 10,
          noPag: true,
          ...params,
        },
      })
      .then((response) => response.data);
  }
}

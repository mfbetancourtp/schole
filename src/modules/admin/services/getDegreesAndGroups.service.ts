import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDegreesAndGroupsWithPagination {
  async run(params: any) {
    return axios
      .get(`${services.dashboard}/degrees-groups`, {
        params,
      })
      .then((response) => response.data);
  }
}

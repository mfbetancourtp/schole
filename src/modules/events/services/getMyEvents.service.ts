import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

interface IParams {
  starDate: string,
  endDate: string,
}

export class GetMyEventsService {
  run(params: IParams) {
    return axios.get(`${services.configurations}/my-events`, { params })
      .then(response => response.data);
  }
}
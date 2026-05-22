import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

interface IParams {
  startDate: string;
  endDate: string;
  durationStartDate: string;
}

export class GetPeriodicityEventsService {
  run(params: IParams) {
    return axios.get(`${services.configurations}/options-periodicity`, { params }).then((response) => response.data);
  }
}

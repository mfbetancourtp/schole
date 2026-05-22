import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetSelectorByTypeRepeatService {
  run(typeRepeatId: any, params?: any) {
    return axios.get(`${services.configurations}/selector-by-type-repeat/${typeRepeatId}`, { params }).then((response) => response.data);
  }
}

import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class SetItemsRecordsStateService {
  run(itemId : number, isActive: number) {
      return axios.put(`${services.admin}/configure-menu/items-state/${itemId}?isActive=${isActive}`
    )
    .then(response => response.data);
  }
}
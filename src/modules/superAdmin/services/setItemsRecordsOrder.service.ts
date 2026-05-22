import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class SetItemsRecordsOrderService {
  run(itemId : number, isUpwards: number) {
      return axios.put(`${services.admin}/configure-menu/items-order?itemId=${itemId}&isUpwards=${isUpwards}`
    )
    .then(response => response.data);
  }
}
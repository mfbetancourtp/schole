import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetItemsRecordsByIdService {
    async run(itemId: number | null = null) {
        return axios.
            get<any>(`${services.admin}/configure-menu/items?itemId=${itemId}`
        )
        .then((response) => response.data);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';


export class GetAllInterfacesByParamsService {
    async run(interfaceId: number | null = null) {
        return axios.
            get(`${services.admin}/configure-interfaces/interfaces-params?interfaceId=${interfaceId}`
        )
        .then((response) => response.data);
    }
}

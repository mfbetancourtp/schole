import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAllInterfacesByModuleIdService {
    async run(moduleId: number | null = null) {
        return axios.
            get(`${services.admin}/configure-interfaces/interfaces?moduleId=${moduleId}`
        )
        .then((response) => response.data);
    }
}

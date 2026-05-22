import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetConvocationStepWithDetailService {
    async run(params: any) {
        return axios.get(`${services.academic}/academic-planning/convocation-step-with-detail/${params.id}`, {params})
            .then(response => response.data);
    }
}
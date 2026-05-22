import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetStudyPlanByIdService {
    run(stusyPlanId: any) {
        return axios.get(`${services.academic}/academic-programs/curriculums/${stusyPlanId}`)
            .then((response) => response.data);
    }
}
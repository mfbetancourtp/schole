import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateMatriculateSubjectsWithPeriodNoteService {
    run(data: any) {
        return axios.post(`${services.academic}/academic-administration/matriculate-subject-periods-from-array`, data)
            .then(response => response.data);
    }
}
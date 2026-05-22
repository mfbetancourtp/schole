import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetMatriculateSubjectsWithPeriodNoteService {
    run(params: any) {
        return axios.get(`${services.academic}/academic-administration/matriculate-subjects-with-period-note`,{params})
            .then(response => response.data);
    }
}
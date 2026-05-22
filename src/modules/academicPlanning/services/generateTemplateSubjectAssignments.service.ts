import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GenerateTemplateSubjectAssignmentsService {
    run(params: any) {
        return axios.get(`${services.academic}/academic-planning/template-import-subject-assignments`, {params})
            .then(response => response.data);
    }
}
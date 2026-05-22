import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDataSubjectAssignmentsForImportService {
    run(params: any) {
        return axios.get(`${services.academic}/academic-planning/subject-assignments-for-import`, {params})
            .then(response => response.data);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetRelatedDataImportSubjectAssignmentsService {
    run() {
        return axios.get(`${services.academic}/academic-planning/related-data-import-subject-assignments`)
            .then(response => response.data);
    }
}
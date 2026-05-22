import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSubjectsCurriculumAndDegreeService {
    run(curriculumId: any, degreeId: number) {
        return axios.get(`${services.academic}/academic-programs/curriculums/${curriculumId}/degrees/${degreeId}/subjects`)
            .then((response) => response.data);
    }
}
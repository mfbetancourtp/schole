import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateMatriculateSubjectPeriodsFromStudentArrayService {
    run(data: any) {
        return axios.post(`${services.academic}/academic-administration/matriculate-subject-periods-from-student-array`, {
            matriculateSubjectPeriods: data,
        }).then(response => response.data);
    }
}
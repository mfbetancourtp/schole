import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetEnrollmentAndAcademicCyclesByEnrollmentIdService {
    run(enrollmentId: number) {
        return axios.get(`${services.academic}/academic-administration/transfer-student-related-data-form/${enrollmentId}`)
            .then(response => response.data);
    }
}
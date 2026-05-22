import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSubjectsForTransferService {
    run(matriculateId: any, academicPeriodGroupId: any) {
        return axios.get(`${services.academic}/academic-administration/subjects-for-transfer?matriculateId=${matriculateId}&academicPeriodGroupId=${academicPeriodGroupId}`)
            .then(response => response.data);
    }
}
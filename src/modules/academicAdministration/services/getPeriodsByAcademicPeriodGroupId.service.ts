import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetPeriodsByAcademicPeriodGroupIdService {
    run(academicPeriodGroupId: number) {
        return axios.get(`${services.academic}/academic-planning/periods-by-apg-id/${academicPeriodGroupId}`)
            .then(response => response.data);
    }
}
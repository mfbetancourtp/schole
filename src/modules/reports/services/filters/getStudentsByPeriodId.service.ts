import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GetStudentsByPeriodIdService {
    run(params: any) {
        return axios.get(`${services.reports}/filters/matriculates-for-report-store`, {
            params,
        }).then(response => response.data);
    }
}

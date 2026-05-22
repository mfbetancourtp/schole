import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateAttendanceControlService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/attendances-control-by-course/${params.academicPeriodGroupId}`, {
            params,
        }).then(response => response.data);
    }
}
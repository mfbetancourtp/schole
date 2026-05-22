import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportStatusActivitiesService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/status-activities-by-academic-period-group/${params.academicPeriodGroupId}`, {
            params,
        }).then(response => response.data);
    }
}
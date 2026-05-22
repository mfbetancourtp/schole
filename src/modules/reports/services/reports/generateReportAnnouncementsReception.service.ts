import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportAnnouncementsReceptionService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/reception-announcements-by-course/${params.academicPeriodGroupId}`, {
            params,
        }).then(response => response.data);
    }
}
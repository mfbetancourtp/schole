import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportDisciplinaryRecordService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/disciplinary-history-by-academic-period-group/${params.academicPeriodGroupId}`, {params}).then(response => response.data);
    }
}

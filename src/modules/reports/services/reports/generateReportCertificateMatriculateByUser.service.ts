import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportCertificateMatriculateByUserService {
    async run(data: any): Promise<any> {
        return axios.get(`${services.reports}/certificate-matriculate-by-user/${data.userId}?academicPeriodId=${data.academicPeriodId}`)
            .then(response => response.data);
    }
}
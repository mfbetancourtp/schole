import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportMedicalRecordsByStudentService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/medical-records-by-student/${data.userId}`, data)
            .then(response => response.data);
    }
}
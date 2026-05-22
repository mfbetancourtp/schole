import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateStudentAcademicReportService {
  async run(data: { matriculateId: number }): Promise<any> {
    return axios.post(`${services.reports}/student-academic-report`, data).then((response) => response.data);
  }
}

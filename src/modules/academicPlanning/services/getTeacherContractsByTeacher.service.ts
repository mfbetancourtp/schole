import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTeacherContractsByTeacherService {
  async run(teacherId: number, params?: { academicPeriodId?: number | null }): Promise<any[]> {
    const response = await axios.get(`${services.academic}/planning/teacher-contracts/by-teacher/${teacherId}`, { params });
    return Array.isArray(response.data?.data) ? response.data.data : [];
  }
}

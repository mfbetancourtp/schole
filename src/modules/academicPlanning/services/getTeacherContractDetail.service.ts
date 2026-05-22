import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTeacherContractDetailService {
  async run(teacherUserId: number, academicPeriodId: number): Promise<any> {
    const response = await axios.get(`${services.academic}/planning/teacher-contracts/detail/${teacherUserId}`, {
      params: { academicPeriodId },
    });
    return response.data?.data ?? response.data;
  }
}

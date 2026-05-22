import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export interface IParams {
  academicPeriodId: number;
  levelId: number;
  degreeId: number;
  groupId: number;
  matriculateId: number;
  studentCategoriesIds: any[];
  itemCode: string;
}

export class GetCountParentsSendMailPerformanceFinalService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/report-store/count-parents-send-emails-final/ax`, data).then((response) => response.data);
  }
}

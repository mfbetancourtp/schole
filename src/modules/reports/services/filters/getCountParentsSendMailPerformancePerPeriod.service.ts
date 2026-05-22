import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export interface IParams {
    academicPeriodId: number;
    levelId: number;
    degreeId: number;
    groupId: number;
    periodId: number;
    matriculateId: number;
    studentCategoriesIds: any[];
    itemCode: string;
}

export class GetCountParentsSendMailPerformancePerPeriodService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/report-store/count-parents-send-emails`, data)
            .then(response => response.data);
    }
}
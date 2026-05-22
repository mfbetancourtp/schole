import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GetAcademicPeriodGroupsFromAcademicPeriodIdService {
    async run(academicPeriodId: number, permission: string | null = null): Promise<any> {

        const params: any = {};

        if (permission) {
            params.itemCode = permission;
        }

        return axios.get(`${services.reports}/filters/academic-period-groups-by-academic-period/${academicPeriodId}`, {
            params,
        }).then(response => response.data);
    }
}
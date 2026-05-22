import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetLevelsByAcademicPeriodIdService {
    run(academicPeriodId: number, permission: any = null) {
        const params: any = {};

        if (permission) {
            params.itemCode = permission;
        }

        return axios.get(`${services.reports}/filters/related-data-groups-by-academic-period/${academicPeriodId}`, {params})
            .then(response => response.data);
    }
}
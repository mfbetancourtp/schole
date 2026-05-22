import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GetLevelsByAcademicPeriodIdService {
    run(academicPeriodId: number) {
        return axios.get(`${services.reports}/filters/related-data-groups-by-academic-period/${academicPeriodId}`).then(response => response.data)
    }
}

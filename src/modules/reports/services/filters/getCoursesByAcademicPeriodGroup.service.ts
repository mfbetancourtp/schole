import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GetCoursesByAcademicPeriodGroupService {
    async run(academicPeriodGroupId: number) {
        return axios.get(`${services.reports}/filters/courses-by-academic-period-group/${academicPeriodGroupId}`).then(response => response.data);
    }
}

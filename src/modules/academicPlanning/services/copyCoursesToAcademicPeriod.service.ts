import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CopyCoursesToAcademicPeriodService {
    async run(data: any): Promise<void> {
        return await axios.post(`${services.academic}/academic-planning/copy-academic-period-groups`, data)
            .then(response => response.data);
    }
}
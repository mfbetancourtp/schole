import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class UpdateAcademicPeriodGroupSupervisorsService {
    async run(data: any): Promise<void> {
        await axios.put(`${services.academic}/academic-planning/academic-period-group-supervisors`, data);
    }
}
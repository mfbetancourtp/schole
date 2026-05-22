import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteAcademicPeriodGroupSupervisorsService {
    async run(academicPeriodGroupSupervisorId: number): Promise<void> {
        await axios.delete(`${services.academic}/academic-planning/academic-period-group-supervisors/${academicPeriodGroupSupervisorId}`);
    }
}
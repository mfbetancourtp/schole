import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteAcademicPeriodGroupsService {
    async run(academicPeriodGroupId: number): Promise<void> {
        await axios.delete(`${services.academic}/academic-planning/academic-period-groups/${academicPeriodGroupId}`);
    }
}
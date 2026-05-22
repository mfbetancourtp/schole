import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteStudyPlanService {
    async run(studyPlanId: number) {
        await axios.delete(`${services.academic}/academic-programs/curriculums/${studyPlanId}`);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteCurriculumSubjectsService {
    async run(curriculumSubjectId: number) {
        await axios.delete(`${services.academic}/academic-programs/curriculum-subjects/${curriculumSubjectId}`);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteSubjectCategoryService {
    async run(subjectCategoryId: number): Promise<void> {
        await axios.delete(`${services.academic}/academic-programs/subject-categories/${subjectCategoryId}`);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteStudentCategoryService {
    async run(studentCategoryId: number): Promise<void> {
        await axios.delete(`${services.academic}/institutional-configuration/student-categories/${studentCategoryId}`);
    }
}
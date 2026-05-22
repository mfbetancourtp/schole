import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteActivitiesCategoryService {
    async run(categoryId: number): Promise<void> {
        await axios.delete(`${services.classroom}/classroom-assessment/activity-categories/${categoryId}`);
    }
}
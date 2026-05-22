import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteSubjectAssignmentsService {
    async run(id: number): Promise<void> {
        await axios.delete(`${services.academic}/academic-planning/subject-assignments/${id}`);
    }
}
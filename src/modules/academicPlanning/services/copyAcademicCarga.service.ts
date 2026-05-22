import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CopyAcademicCargaService {
    async run(data: any): Promise<void> {
        await axios.post(`${services.academic}/academic-planning/subject-assignments-from-array`, data)
            .then(response => response.data);
    }
}
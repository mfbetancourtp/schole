import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteDegreeService {
    async run(degreeId: number) {
        await axios.delete(`${services.academic}/academic-programs/degrees/${degreeId}`);
    }
}
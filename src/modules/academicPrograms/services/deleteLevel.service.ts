import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteLevelService {
    async run(levelId: number) {
        await axios.delete(`${services.academic}/academic-programs/levels/${levelId}`);
    }
}
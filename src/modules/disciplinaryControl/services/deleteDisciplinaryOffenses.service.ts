import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteDisciplinaryOffensesService {
    async run(id: any): Promise<void> {
        await axios.delete(`${services.classroom}/disciplinary-control/disciplinary-offenses/${id}`);
    }
}
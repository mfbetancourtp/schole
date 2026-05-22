import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteOffenseTemplatesService {
    async run(id: number) {
        await axios.delete(`${services.classroom}/disciplinary-control/offense-templates/offense-templates/${id}`);
    }
}
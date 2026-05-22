import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteConceptService {
    async run(id: number) {
        await axios.delete(`${services.casurid}/catalogue/admin/products/${id}`);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeletePlanService {
    async run(planId: number): Promise<void> {
        await axios.delete(`${services.casurid}/catalogue/admin/products/${planId}`);
    }
}
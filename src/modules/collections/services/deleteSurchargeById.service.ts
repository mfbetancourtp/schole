import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteSurchargeByIdService {
    async run(surchargeId: number): Promise<void> {
        await axios.delete(`${services.collections}/surcharges/${surchargeId}`);
    }
}
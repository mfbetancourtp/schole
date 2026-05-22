import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteInterfacesByIdService {
    async run(interfaceId: number): Promise<void> {
        await axios.delete(`${services.admin}/configure-interfaces/interfaces/${interfaceId}`);
    }
}
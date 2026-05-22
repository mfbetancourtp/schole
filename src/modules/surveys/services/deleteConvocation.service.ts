import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteConvocationService {
    async run(convocationId: number) {
        await axios.delete(`${services.academic}/academic-planning/convocations/${convocationId}`);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteConvocationStepService {
    async run(convocationStepId: number) {
        await axios.delete(`${services.academic}/academic-planning/convocation-steps/${convocationStepId}`);
    }
}
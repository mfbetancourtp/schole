import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface ConvocationStep {
    id: number;
    order: number;
}

interface IUpdateOrderConvocationStepsService {
    convocationSteps: ConvocationStep[];
}

export class UpdateOrderConvocationStepsService {
    async run(data: IUpdateOrderConvocationStepsService) {
        await axios.post(`${services.academic}/academic-planning/convocation-steps-update-order`, data);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface Questions {
    id: number;
    order: number;
}

interface IUpdateOrderQuestionsService {
    questions: Questions[];
}

export class UpdateOrderQuestionsService {
    async run(data: IUpdateOrderQuestionsService): Promise<void> {
        await axios.post(`${services.surveys}/admin/update-order-questions`, data);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface SurveySections {
    id: number;
    order: number;
}

interface IUpdateOrderSectionsCustomFormService {
    surveySections: SurveySections[];
}

export class UpdateOrderSectionsCustomFormService {
    async run(data: IUpdateOrderSectionsCustomFormService): Promise<void> {
        await axios.post(`${services.surveys}/admin/update-order-survey-sections`, data);
    }
}
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteCustomFormService {
    async run(id: number) {
        await axios.delete(`${services.surveys}/admin/surveys/${id}`);
    }
}
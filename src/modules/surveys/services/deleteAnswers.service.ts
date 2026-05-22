import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteAnswersService {
    async run(params: any) {
        await axios.post(`${services.surveys}/delete-answers`, params);
    }
}
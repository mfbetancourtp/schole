import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteTopicService {
    async run(id: any): Promise<void> {
        await axios.delete(`${services.classroom}/classroom-administration/topics/${id}`);
    }
}
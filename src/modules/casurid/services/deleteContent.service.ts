import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteContentService {
    async run(contentId: number): Promise<void> {
        await axios.delete(`${services.casurid}/catalogue/admin/contents/${contentId}`);
    }
}
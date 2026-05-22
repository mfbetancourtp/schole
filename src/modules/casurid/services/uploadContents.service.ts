import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class UploadContentsService {
    async run(importId: number) {
        return axios.post(`${services.casurid}/catalogue/admin/save-contents/${importId}`).then(response => response.data);
    }
}

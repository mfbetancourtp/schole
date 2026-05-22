import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class ImportContentsService {
    async run(file: File, onUploadProgress: (progressEvent: ProgressEvent) => void) {
        const formData = new FormData();

        formData.append('file', file);

        return axios.post(`${services.casurid}/catalogue/admin/upload-contents-temp`, formData, {
            onUploadProgress,
        }).then(response => response.data);
    }
}

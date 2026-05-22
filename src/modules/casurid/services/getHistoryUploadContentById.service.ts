import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {HistoryUploadContentDto} from '../dtos/historyUploadContent.dto';

export class GetHistoryUploadContentByIdService {
    async run(historyUploadId: number | string) {
        return axios.get(`${services.casurid}/catalogue/admin/history-upload-contents/${historyUploadId}`).then(response => {
            response.data.jsonResponse = JSON.parse(response.data.jsonResponse);

            return response.data as HistoryUploadContentDto;
        });
    }
}

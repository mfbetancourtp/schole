import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetHistoryUploadContentService {
    async run(params: ParamsPaginationDto) {
        return axios.get(`${services.casurid}/catalogue/admin/history-upload-contents`, {
            params,
        }).then(response => response.data);
    }
}

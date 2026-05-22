import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export interface IParams {
    documentSignerId: number;
    convocationEnrolId: number;
    documentSignatureId: number | null;
}

export class RelatedDataSpecifySignaturesService {
    async run(params: IParams) {
        return axios.get(`${services.academic}/academic-administration/related-data-documents-signatures`, { params })
            .then(response => response.data);
    }
}
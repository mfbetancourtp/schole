import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAdminRequestDocumentsWithPaginationService {
  async run(params: Record<string, any> = {}) {
    return axios.get(`${services.structure}/admin/request-documents`, { params }).then((response) => response.data);
  }
}

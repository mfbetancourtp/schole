import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { RequestDocumentDetailDto } from '../dtos/requestManagement.dto';

export class GetAdminRequestDocumentByIdService {
  async run(id: number): Promise<RequestDocumentDetailDto> {
    return axios.get<RequestDocumentDetailDto>(`${services.structure}/admin/request-documents/${id}`).then((response) => response.data);
  }
}

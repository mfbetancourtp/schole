import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { UpdateRequestStatusDto } from '../dtos/requestManagement.dto';

export class CreateOrUpdateAdminRequestDocumentStatusService {
  async run(id: number, data: UpdateRequestStatusDto): Promise<void> {
    return axios.put(`${services.structure}/admin/request-documents/${id}/status`, data).then(() => undefined);
  }
}

import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { RequestDocumentStatsDto } from '../dtos/requestManagement.dto';

export class GetAdminRequestDocumentsStatsService {
  async run(): Promise<RequestDocumentStatsDto[]> {
    return axios.get<RequestDocumentStatsDto[]>(`${services.structure}/admin/request-documents/stats`).then((response) => response.data);
  }
}

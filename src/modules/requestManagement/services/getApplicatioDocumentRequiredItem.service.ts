import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetApplicationDocumentRequiredService {
  run(
    params: {
      noPag?: boolean;
      search?: string;
      page?: number;
      perPage?: number;
    } = { noPag: true }
  ) {
    return axios
      .get<any>(`${services.structure}/application-document-required`, {
        params,
      })
      .then((response) => response.data);
  }
}

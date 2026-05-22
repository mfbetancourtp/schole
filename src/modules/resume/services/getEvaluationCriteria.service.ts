import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface GetEvaluationCriteriaParams {
  sort?: string;
  order?: string;
  noPag?: boolean;
  profileSectionsId?: number | string | null;
}

export class GetEvaluationCriteriaService {
  run(params?: GetEvaluationCriteriaParams): Promise<any[]> {
    return axios
      .get<any[]>(`${services.structure}/evaluation-criteria`, {
        params: {
          sort: 'id',
          order: 'DESC',
          noPag: true,
          ...params,
        },
      })
      .then((response) => response.data);
  }
}

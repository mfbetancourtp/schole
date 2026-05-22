import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEvaluationCriteriaTypesService {
  async run(params: { profileSectionsId?: number; search?: string } = {}) {
    if (!params.profileSectionsId) {
      return { data: [] };
    }

    const response = await axios
      .get<{
        type: string;
        items: any[];
      }>(`${services.structure}/evaluation-criteria/types/${params.profileSectionsId}`)
      .then((response) => response.data);

    const items = Array.isArray(response.items) ? response.items : [];
    const search = params.search?.toLowerCase().trim();

    return {
      data: search ? items.filter((item) => item.name?.toLowerCase().includes(search)) : items,
    };
  }
}

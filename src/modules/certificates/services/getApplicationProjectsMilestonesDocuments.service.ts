import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { PendingDelivery } from '../dtos/tutorPanel.dto';

interface IGetApplicationProjectsMilestonesDocumentsParams {
  applicationProjectsMilestonesId: number;
}

export class GetApplicationProjectsMilestonesDocumentsService {
  async run(params: IGetApplicationProjectsMilestonesDocumentsParams): Promise<PendingDelivery[]> {
    const response = await axios.get<any>(`${services.structure}/application-projects-milestones-documents`, { params });
    const payload = response.data?.data ?? response.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
  }
}

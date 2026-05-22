import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { TutorPanelMilestoneDto } from '../dtos/tutorPanel.dto';

interface IGetTutorPanelParams {
  institutionId: number;
  status?: string;
}

export class GetTutorPanelService {
  async run(params: IGetTutorPanelParams): Promise<TutorPanelMilestoneDto[]> {
    const response = await axios.get<any>(`${services.structure}/application-projects-milestones`, { params });
    const payload = response.data?.data ?? response.data;

    if (Array.isArray(payload)) return payload.map(TutorPanelMilestoneDto.fromJson);
    if (Array.isArray(payload?.data)) return payload.data.map(TutorPanelMilestoneDto.fromJson);

    return [];
  }
}

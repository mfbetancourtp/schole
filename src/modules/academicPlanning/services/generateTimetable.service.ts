import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export type GenerateTimetablePayload = {
  institutionId?: number | null;
  curriculumOfferingId?: number | null;
  timetableId?: string | number | null;
  query?: string;
};

export class GenerateTimetableService {
  async run(data: GenerateTimetablePayload) {
    const response = await axios.post(`${services.smartClassroom}/timetables/generate`, data);
    return response.data;
  }
}

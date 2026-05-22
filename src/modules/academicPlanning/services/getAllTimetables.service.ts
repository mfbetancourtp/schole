import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface GetAllTimetablesParams {
  institutionId?: string | number | null;
  curriculumOfferingId?: string | number | null;
}

export class GetAllTimetablesService {
  async run(params: GetAllTimetablesParams) {
    const response = await axios.get(`${services.smartClassroom}/timetables`, {
      params,
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }
}

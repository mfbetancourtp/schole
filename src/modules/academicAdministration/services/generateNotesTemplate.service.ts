import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GenerateNotesTemplateService {
  run(academicPeriodGroupId: number) {
    return axios.get(`${services.academic}/academic-administration/academic-period-group/${academicPeriodGroupId}/export-matriculate-subjects`)
      .then(response => response.data);
  }
}
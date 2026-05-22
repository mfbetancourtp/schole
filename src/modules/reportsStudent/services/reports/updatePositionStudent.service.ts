import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

interface IUpdatePositionStudentService {
  matriculateId: number;
  periodId: number;
  position: number;
  isEdit: number;
}

export class UpdatePositionStudentService {
  async run(data: IUpdatePositionStudentService, matriculateNotePeriodId: any): Promise<void> {
    await axios.put(`${services.academic}/academic-administration/matriculate-note-period/${matriculateNotePeriodId}`, data);
  }
}

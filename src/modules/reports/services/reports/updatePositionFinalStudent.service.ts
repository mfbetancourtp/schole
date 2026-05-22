import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

interface IUpdatePositionStudentService {
  matriculateId: number;
  academicPeriodId: number;
  position: number;
  isEdit: number;
}

export class UpdatePositionFinalStudentService {
  async run(data: IUpdatePositionStudentService, matriculateNoteYearId: any): Promise<void> {
    await axios.put(`${services.academic}/academic-administration/matriculate-note-year/${matriculateNoteYearId}`, data);
  }
}

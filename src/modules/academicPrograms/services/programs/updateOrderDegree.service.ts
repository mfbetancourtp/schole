import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { DegreeDto } from '../../dtos/programs/degree.dto';

export class UpdateOrderDegreeService {
  async run(levelId: number, data: DegreeDto[]): Promise<void> {
    await axios.post(`${services.academic}/academic-programs/degrees-batch/${levelId}`, data);
  }
}

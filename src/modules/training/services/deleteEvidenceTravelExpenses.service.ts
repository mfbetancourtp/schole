import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEvidenceTravelExpensesService {
  async run(travelExpenses: any) {
    await axios.delete(`${services.classroom}/classroom-administration/travel-expenses-url-consolidate-evidence/${travelExpenses}`);
  }
}

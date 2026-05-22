import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { BudgetReportDto } from '../dtos/budgetLinesReport.dto';

export class GetDataReportDetailService {
  async run(academicPeriods: number, budgetLine: number) {
    return axios
      .get<BudgetReportDto>(`${services.budget}/admin/academic-period-budgets-details-report?academicPeriodId=${academicPeriods}&budgetLineId=${budgetLine}`)
      .then((response) => response.data);
  }
}

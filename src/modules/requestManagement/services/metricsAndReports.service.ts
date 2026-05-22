import type { MetricsAndReportsData } from '../dtos/metricsAndReports.dto';
import { metricsAndReportsMock } from '../mocks/metricsAndReports';

class MetricsAndReportsService {
  async getData(): Promise<MetricsAndReportsData> {
    return metricsAndReportsMock;
  }
}

export const metricsAndReportsService = new MetricsAndReportsService();

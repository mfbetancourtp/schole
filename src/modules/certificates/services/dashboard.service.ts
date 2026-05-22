import type { DashboardData } from '../dtos/dashboard.dto';
import { dashboardMock } from '../mocks/dashboard';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    await delay(600);
    return dashboardMock;
  }
}

export const dashboardService = new DashboardService();

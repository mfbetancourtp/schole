import type { WellnessService } from '../dtos/serviceCatalog.dto';
import { servicesMock } from '../mocks/serviceCatalog';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class ServiceCatalogService {
  async getServices(): Promise<WellnessService[]> {
    await delay(600);
    return servicesMock;
  }
}

export const serviceCatalogService = new ServiceCatalogService();

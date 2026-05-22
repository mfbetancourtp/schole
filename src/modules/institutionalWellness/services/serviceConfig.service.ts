import { ServiceConfig, ServiceConfigForm } from '../dtos/serviceConfig.dto';
import { serviceConfigMock } from '../mocks/serviceConfig';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let services: ServiceConfig[] = [...serviceConfigMock];
let nextId = services.length + 1;

class ServiceConfigService {
  async getServices(search?: string): Promise<ServiceConfig[]> {
    await delay(600);
    if (!search) return [...services];
    const q = search.toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q));
  }

  async create(form: ServiceConfigForm): Promise<ServiceConfig> {
    await delay(400);
    const newService: ServiceConfig = {
      id: nextId++,
      icon: form.icon,
      iconLabel: form.icon,
      name: form.name,
      description: form.description,
      status: 'active',
      pendingCount: 0,
      requirements: form.requirements,
      responsibles: form.responsibles,
    };
    services.push(newService);
    return newService;
  }

  async update(id: number, form: ServiceConfigForm): Promise<ServiceConfig> {
    await delay(400);
    const index = services.findIndex((s) => s.id === id);
    if (index !== -1) {
      services[index] = { ...services[index], ...form };
    }
    return services[index];
  }

  async toggleStatus(id: number): Promise<void> {
    await delay(300);
    const item = services.find((s) => s.id === id);
    if (item) {
      item.status = item.status === 'active' ? 'inactive' : 'active';
    }
  }

  async delete(id: number): Promise<void> {
    await delay(400);
    services = services.filter((s) => s.id !== id);
  }
}

export const serviceConfigService = new ServiceConfigService();

import type { AdmissionProcess } from '../dtos/admissionProcess.dto';
import { getAdmissionProcessesDb } from '../mocks/admissionProcesses';

const wait = async (ms = 120) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class GetAdmissionProcessesService {
  async run(): Promise<AdmissionProcess[]> {
    await wait();
    return getAdmissionProcessesDb();
  }
}

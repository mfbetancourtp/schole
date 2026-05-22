import type { AdmissionProcess } from '../dtos/admissionProcess.dto';
import { duplicateAdmissionProcessDb } from '../mocks/admissionProcesses';

const wait = async (ms = 120) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class DuplicateAdmissionProcessService {
  async run(id: string): Promise<AdmissionProcess | null> {
    await wait();
    return duplicateAdmissionProcessDb(id);
  }
}

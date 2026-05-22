import type { AdmissionProcess } from '../dtos/admissionProcess.dto';
import { createAdmissionProcessId, upsertAdmissionProcessDb } from '../mocks/admissionProcesses';

const wait = async (ms = 150) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class CreateOrUpdateAdmissionProcessService {
  async run(process: Omit<AdmissionProcess, 'id'> & { id?: string }): Promise<AdmissionProcess> {
    await wait();

    return upsertAdmissionProcessDb({
      ...process,
      id: process.id ?? createAdmissionProcessId(),
    });
  }
}

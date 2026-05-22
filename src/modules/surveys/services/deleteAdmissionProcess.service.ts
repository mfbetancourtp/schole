import { deleteAdmissionProcessDb } from '../mocks/admissionProcesses';

const wait = async (ms = 120) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class DeleteAdmissionProcessService {
  async run(id: string): Promise<void> {
    await wait();
    deleteAdmissionProcessDb(id);
  }
}

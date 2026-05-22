import type { AdmissionProcessReferenceData } from '../dtos/admissionProcess.dto';
import { getAdmissionReferenceData } from '../mocks/admissionProcesses';

const wait = async (ms = 80) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class GetAdmissionProcessReferenceDataService {
  async run(): Promise<AdmissionProcessReferenceData> {
    await wait();
    return getAdmissionReferenceData();
  }
}

import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UploadAgreementDocumentsService {
  run(id: number, documentMain?: File | null, documentAnexed?: File | null): Promise<any> {
    const fd = new FormData();
    if (documentMain) fd.append('documentMain', documentMain);
    if (documentAnexed) fd.append('documentAnexed', documentAnexed);
    return axios.patch(`${services.structure}/agreements-institutional/${id}/documents`, fd).then((r) => r.data);
  }
}

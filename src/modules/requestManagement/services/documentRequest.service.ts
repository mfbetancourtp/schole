import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { DocumentRequestDetailDTO, NewRequestFormData } from '../dtos/documentRequest.dto';

class DocumentRequestService {
  async getPageData(): Promise<any> {
    return axios.get<any>(`${services.structure}/request-documents`).then((response) => response.data);
  }

  async getApplicationTypes(): Promise<any> {
    return axios.get<any>(`${services.structure}/application-types`).then((response) => response.data);
  }

  async getRequestDetail(requestId: string | number): Promise<DocumentRequestDetailDTO> {
    return axios.get<DocumentRequestDetailDTO>(`${services.structure}/request-documents/${requestId}`).then((response) => response.data);
  }

  async submitRequest(form: NewRequestFormData): Promise<any> {
    const payload = {
      applicationTypesId: form.documentTypeId,
      academicPeriodsId: form.academicPeriodId,
      description: form.reason,
    };
    return axios.post<any>(`${services.structure}/request-documents`, payload).then((response) => response.data);
  }

  async uploadAttachment(requestDocumentsId: number, file: File, applicationDocumentRequiredId: number = 1): Promise<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('requestDocumentsId', String(requestDocumentsId));
    formData.append('applicationDocumentRequiredId', String(applicationDocumentRequiredId));
    return axios
      .post<any>(`${services.structure}/request-attachments`, formData, {
        params: { requestDocumentsId },
      })
      .then((response) => response.data);
  }

  async downloadAttachments(requestDocumentsId: string): Promise<void> {
    const response = await axios.get(`${services.structure}/request-attachments`, {
      params: {
        requestDocumentsId,
        noPag: 'true',
      },
      responseType: 'blob',
    });

    const blob = response.data as Blob;
    const contentType = String((response.headers as any)?.['content-type'] ?? '');

    if (contentType.includes('application/json')) {
      const text = await blob.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (_e) {
        return;
      }

      const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.data) ? parsed.data : [];
      const first = rows[0];
      const url = first?.url ?? first?.fileUrl ?? first?.downloadUrl;
      if (typeof url === 'string' && url) {
        window.open(url, '_blank');
      }
      return;
    }

    const disposition = String((response.headers as any)?.['content-disposition'] ?? '');
    const filenameMatch = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const filename = decodeURIComponent(filenameMatch?.[1] ?? filenameMatch?.[2] ?? `request-attachments-${requestDocumentsId}`);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async downloadDocument(requestId: string): Promise<any> {
    return this.downloadAttachments(requestId);
  }
}

export const documentRequestService = new DocumentRequestService();

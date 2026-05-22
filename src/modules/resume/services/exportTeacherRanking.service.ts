import type { AxiosResponse } from 'axios';

import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface ExportTeacherRankingParams {
  evaluationModelId?: number | string | null;
}

const getFilenameFromDisposition = (contentDisposition: string, fallbackFilename: string) => {
  const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const filename = filenameMatch?.[1] || filenameMatch?.[2] || fallbackFilename;

  return decodeURIComponent(filename.trim());
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export class ExportTeacherRankingService {
  async run(params?: ExportTeacherRankingParams): Promise<AxiosResponse<Blob>> {
    return axios.get<Blob>(`${services.structure}/teacher-ranking/export`, {
      params,
      responseType: 'blob',
    });
  }

  async download(params?: ExportTeacherRankingParams, fallbackFilename = 'teacher-ranking.csv') {
    const response = await this.run(params);
    const contentDisposition = String((response.headers as Record<string, string | undefined>)?.['content-disposition'] ?? '');
    const contentType = String((response.headers as Record<string, string | undefined>)?.['content-type'] ?? 'text/csv;charset=utf-8');
    const filename = getFilenameFromDisposition(contentDisposition, fallbackFilename);
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });

    downloadBlob(blob, filename);
  }
}
